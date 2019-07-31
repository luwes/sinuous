import { h } from 'sinuous';

const HelloMessage = ({ name }) => html`
  <!-- Prints Hello World -->
  <div>Hello ${name}</div>
`;

document.querySelector('.hello-example').append(
  html`<${HelloMessage} name=World />`
);
