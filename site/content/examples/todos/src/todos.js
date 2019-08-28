import { o, h } from 'sinuous';
import { map } from 'sinuous/map';

const TodoApp = () => {
  let items = o([]);
  let text = o('');

  const view = html`
    <div>
      <h3>TODO</h3>
      <${TodoList} items=${items} />
      <form onsubmit=${handleSubmit}>
        <label htmlFor="new-todo">
          What needs to be done?
        </label>
        <input
          id="new-todo"
          onchange=${handleChange}
          value=${text}
        />
        <button>
          Add #${() => items().length + 1}
        </button>
      </form>
    </div>
  `;

  function handleSubmit(e) {
    e.preventDefault();
    if (!text().length) {
      return;
    }
    const newItem = {
      text: text(),
      id: Date.now()
    };
    items(items().concat(newItem));
    text('');
  }

  function handleChange(e) {
    text(e.target.value);
  }

  return view;
};

const TodoList = ({ items }) => {
  return html`
    <ul>
      ${map(items, (item) => html`<li id=${item.id}>${item.text}</li>`)}
    </ul>
  `;
};

document.querySelector('.todos-example').append(TodoApp());
