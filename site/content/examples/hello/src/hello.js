import { h } from 'sinuous';

const HelloMessage = ({ name }) => html`
  <div>Hello ${name}</div>
`;

document.querySelector('.hello-example').append(
  html`<${HelloMessage} name=World />`
);
