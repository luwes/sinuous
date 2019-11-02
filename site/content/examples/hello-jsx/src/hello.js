/** @jsx h */
/** @jsxFrag h */
import { h } from 'sinuous';

const HelloMessage = ({ name }) => (
  <>
    <div>Hello {name}</div>
    <div>How are you?</div>
  </>
);

document.querySelector('.hello-example').append(
  <HelloMessage name="World" />
);
