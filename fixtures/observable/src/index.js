import o, * as api from 'sinuous/observable';
import each from 'sinuous/each';
import sinuous from 'sinuous';

const h = sinuous(api);
const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);

const count = o(5);
const style = o({});
const onclick = o(clicked);

let list = o([
  { id: 1, text: o('bread') },
  { id: 2, text: o('milk') },
  { id: 3, text: o('honey') },
  { id: 4, text: o('chips') },
  { id: 5, text: o('cookie') }
]);

function clicked() {
  onclick(false);
  console.log('removed click handler');

  h.cleanUp();
  console.log('removed observers');
}

const template = () => {
  return html`
    <div>
      <h1 style=${style}>
        Sinuous <sup>${count}</sup>
        <div>${() => count() + count()}</div>
        <button onclick="${onclick}">Remove click handler + stop observing</button>
      </h1>
      <ul>
        ${each(list, (item) => html`<li id=${item.id}>${item.text}</li>`)}
      </ul>
    </div>
  `;
};

document.querySelector('.sinuous').append(template());
setInterval(() => {
  style({ color: randomColor() });
  count(count() + 1);

  list([...list(), { id: count(), text: o('cookie' + count()) }]);

  const randomIndex = Math.floor(Math.random() * list().length);
  list()[randomIndex].text('YOU WON!!!');
}, 1000);
