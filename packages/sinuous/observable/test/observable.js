import test from 'tape';
import { spy } from 'sinon';
import o, { subscribe, unsubscribe } from '../src/observable.js';

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

test('nested subscribe cleans up inner subscriptions', function(t) {
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
