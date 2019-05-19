import test from 'tape';
import { spy } from 'sinon';
import o, { subscribe, unsubscribe, cleanup } from '../src/observable.js';

test('initial value can be set', function(t) {
  let title = o('Groovy!');
  t.equal(title(), 'Groovy!');
  t.end();
});

test('runs function on subscribe', function(t) {
  subscribe(t.pass);
  t.end();
});

test('observable can be set without subscription', function(t) {
  let title = o();
  title('Groovy!');
  t.equal(title(), 'Groovy!');
  t.end();
});

test('updates when the observable is set', function(t) {
  let title = o();
  let text;
  subscribe(() => (text = title()));

  title('Welcome to Sinuous!');
  t.equal(text, 'Welcome to Sinuous!');

  title('Groovy!');
  t.equal(text, 'Groovy!');

  t.end();
});

test('observable unsubscribe', function(t) {
  let title = o('Initial title');
  let text;
  const unsubscribe = subscribe(() => (text = title()));

  title('Welcome to Sinuous!');
  t.equal(text, 'Welcome to Sinuous!');

  unsubscribe();

  title('Groovy!');
  t.equal(text, 'Welcome to Sinuous!');

  t.end();
});

test('nested subscribe', function(t) {
  let apple = o('apple');
  let lemon = o('lemon');
  let onion = o('onion');
  let tempApple;
  let tempLemon;
  let tempOnion;

  let veggieSpy;
  const fruitSpy = spy(() => {
    tempApple = apple();

    veggieSpy = spy(() => {
      tempOnion = onion();
    });

    subscribe(veggieSpy);

    tempLemon = lemon();
  });

  subscribe(fruitSpy);

  t.equal(tempApple, 'apple');
  t.equal(tempLemon, 'lemon');
  t.equal(tempOnion, 'onion');
  t.assert(fruitSpy.calledOnce);
  t.assert(veggieSpy.calledOnce);

  onion('peel');
  t.equal(tempOnion, 'peel');
  t.assert(fruitSpy.calledOnce);
  t.assert(veggieSpy.calledTwice);

  lemon('juice');
  t.equal(tempLemon, 'juice');
  t.assert(fruitSpy.calledTwice);
  // this will be a new spy that was executed once
  t.assert(veggieSpy.calledOnce);

  t.end();
});

test('one level nested subscribe cleans up inner subscriptions', function(t) {
  let apple = o('apple');
  let lemon = o('lemon');
  let grape = o('grape');
  let onion = o('onion');
  let bean = o('bean');
  let carrot = o('carrot');
  let onions = '';
  let beans = '';
  let carrots = '';

  subscribe(() => {
    apple();
    subscribe(() => (onions += onion()));
    grape();
    subscribe(() => (beans += bean()));
    subscribe(() => (carrots += carrot()));
    lemon();
  });

  apple('juice');
  lemon('juice');
  grape('juice');

  bean('bean');

  t.equal(onions, 'onion'.repeat(4));
  t.equal(beans, 'bean'.repeat(5));
  t.end();
});

test('three level nested subscribe cleans up inner subscriptions', function(t) {
  let apple = o('apple');
  let lemon = o('lemon');
  let grape = o('grape');
  let onion = o('onion');
  let bean = o('bean');
  let carrot = o('carrot');
  let peanut = o('peanut');
  let onions = 0;
  let beans = 0;
  let carrots = 0;
  let peanuts = 0;

  const unsubscribe = subscribe(() => {
    apple();
    subscribe(() => {
      bean();
      beans += 1;
      subscribe(() => {
        onions += 1;
        onion();
        subscribe(() => peanut() && (peanuts += 1));
      });
    });
    grape();
    subscribe(() => carrot() && (carrots += 1));
    lemon();
  });

  apple('juice');
  lemon('juice');
  grape('juice');
  t.equal(beans, 4);

  bean('bean');
  t.equal(beans, 5);

  onion('onion');
  onion('onion');
  onion('onion');
  t.equal(onions, 8);

  peanut('peanut');
  peanut('peanut');
  t.equal(peanuts, 10);

  unsubscribe();

  apple('juice');
  lemon('juice');
  grape('juice');

  bean('bean');
  t.equal(beans, 5);

  onion('onion');
  onion('onion');
  onion('onion');
  t.equal(onions, 8);

  peanut('peanut');
  peanut('peanut');
  t.equal(peanuts, 10);

  t.end();
});

test('standalone unsubscribe works', function(t) {
  let carrot = o();
  const computed = spy(() => {
    carrot();
  });
  subscribe(computed);
  carrot('juice');

  unsubscribe(computed);
  carrot('juice');

  t.assert(computed.calledTwice);
  t.end();
});

test('cleanup cleans up on update', function(t) {
  let carrot = o();
  let button = document.createElement('button');
  // IE11 requires the button to be in dom before `button.click()` works.
  document.body.appendChild(button);
  let count = 0;

  const computed = spy(() => {
    carrot();
    const onClick = () => (count += 1);
    button.addEventListener('click', onClick);
  });

  const unsubscribe = subscribe(computed);
  carrot(9);
  carrot(10);
  button.click();
  t.equal(count, 3);
  unsubscribe();

  count = 0;
  button = document.createElement('button');
  document.body.appendChild(button);

  const computedWithCleanup = spy(() => {
    carrot();
    const onClick = () => (count += 1);
    button.addEventListener('click', onClick);
    cleanup(() => button.removeEventListener('click', onClick));
  });

  subscribe(computedWithCleanup);
  carrot(9);
  carrot(10);
  button.click();
  t.equal(count, 1);

  t.end();
});
