import sinuous from 'sinuous';
const h = sinuous(fn => fn());

describe("h.insert", () => {
  // <div>before<!-- insert -->after</div>
  const container = document.createElement("div");

  it("inserts nothing for null", () => {
    const res = insert(null);
    expect(res.innerHTML).to.equal("");
    expect(res.childNodes.length).to.equal(0);
  });

  it("inserts nothing for undefined", () => {
    const res = insert(undefined);
    expect(res.innerHTML).to.equal("");
    expect(res.childNodes.length).to.equal(0);
  });

  it("inserts nothing for false", () => {
    const res = insert(false);
    expect(res.innerHTML).to.equal("");
    expect(res.childNodes.length).to.equal(0);
  });

  it("inserts nothing for true", () => {
    const res = insert(true);
    expect(res.innerHTML).to.equal("");
    expect(res.childNodes.length).to.equal(0);
  });

  it("inserts nothing for null in array", () => {
    const res = insert(["a", null, "b"]);
    expect(res.innerHTML).to.equal("ab");
    expect(res.childNodes.length).to.equal(2);
  });

  it("inserts nothing for undefined in array", () => {
    const res = insert(["a", undefined, "b"]);
    expect(res.innerHTML).to.equal("ab");
    expect(res.childNodes.length).to.equal(2);
  });

  it("inserts nothing for false in array", () => {
    const res = insert(["a", false, "b"]);
    expect(res.innerHTML).to.equal("ab");
    expect(res.childNodes.length).to.equal(2);
  });

  it("inserts nothing for true in array", () => {
    const res = insert(["a", true, "b"]);
    expect(res.innerHTML).to.equal("ab");
    expect(res.childNodes.length).to.equal(2);
  });

  it("can insert strings", () => {
    const res = insert("foo");
    expect(res.innerHTML).to.equal("foo");
    expect(res.childNodes.length).to.equal(1);
  });

  it("can insert a node", () => {
    const node = document.createElement("span");
    node.textContent = "foo";
    expect(insert(node).innerHTML).to.equal("<span>foo</span>");
  });

  it("can re-insert a node, thereby moving it", () => {
    const node = document.createElement("span");
    node.textContent = "foo";

    const first = insert(node),
      second = insert(node);

    expect(first.innerHTML).to.equal("");
    expect(second.innerHTML).to.equal("<span>foo</span>");
  });

  // it('can spread over element', () => {
  //   const node = document.createElement("span");
  //   r.spread(node, () => ({href: '/', for: 'id', classList: {danger: true}, events: {custom: e => e}, style: {color: 'red'}, something: 'good'}))
  //   expect(node.getAttribute('href')).to.equal('/');
  //   expect(node.htmlFor).to.equal('id');
  //   expect(node.className).to.equal('danger');
  //   expect(node.style.color).to.equal('red');
  //   expect(node.something).to.equal('good');
  // });

  it("can insert an array of strings", () => {
    expect(insert(["foo", "bar"]).innerHTML).to.equal("foobar", "array of strings");
  });

  it("can insert an array of nodes", () => {
    const nodes = [ document.createElement("span"), document.createElement("div")];
    nodes[0].textContent = "foo";
    nodes[1].textContent = "bar";
    expect(insert(nodes).innerHTML).to.equal("<span>foo</span><div>bar</div>");
  });

  it("can insert a changing array of nodes", () => {
    var parent = document.createElement("div"),
      current = "",
      n1 = document.createElement("span"),
      n2 = document.createElement("div"),
      n3 = document.createElement("span"),
      n4 = document.createElement("div"),
      orig = [n1, n2, n3, n4];

    n1.textContent = "1";
    n2.textContent = "2";
    n3.textContent = "3";
    n4.textContent = "4";

    var origExpected = expected(orig);

    // identity
    test([n1, n2, n3, n4]);

    // 1 missing
    test([    n2, n3, n4]);
    test([n1,     n3, n4]);
    test([n1, n2,     n4]);
    test([n1, n2, n3    ]);

    // 2 missing
    test([        n3, n4]);
    test([    n2,     n4]);
    test([    n2, n3    ]);
    test([n1,         n4]);
    test([n1,     n3    ]);
    test([n1, n2,       ]);

    // 3 missing
    test([n1            ]);
    test([    n2        ]);
    test([        n3    ]);
    test([            n4]);

    // all missing
    test([              ]);

    // swaps
    test([n2, n1, n3, n4]);
    test([n3, n2, n1, n4]);
    test([n4, n2, n3, n1]);

    // rotations
    test([n2, n3, n4, n1]);
    test([n3, n4, n1, n2]);
    test([n4, n1, n2, n3]);

    // reversal
    test([n4, n3, n2, n1]);

    function test(array) {
      current = h.insert(parent, array, current);
      expect(parent.innerHTML).to.equal(expected(array));
      current = h.insert(parent, orig, current);
      expect(parent.innerHTML).to.equal(origExpected);
    }

    function expected(array) {
      return array.map(n => n.outerHTML).join("");
    }
  });

  it("can insert nested arrays", () => {
    expect(insert(["foo", ["bar", "blech"]]).innerHTML)
    .to.equal("foobarblech", "array of array of strings");
  });

  function insert(val) {
    const parent = container.cloneNode(true);
    h.insert(parent, val);
    return parent;
  }
});

describe("h.insert with Markers", () => {
  // <div>before<!-- insert -->after</div>
  var container = document.createElement("div");
  container.appendChild(document.createTextNode("before"));
  container.appendChild(document.createTextNode(""));
  container.appendChild(document.createTextNode("after"));

  it("inserts nothing for null", () => {
    const res = insert(null);
    expect(res.innerHTML).to.equal("beforeafter");
    expect(res.childNodes.length).to.equal(3);
  });

  it("inserts nothing for undefined", () => {
    const res = insert(undefined);
    expect(res.innerHTML).to.equal("beforeafter");
    expect(res.childNodes.length).to.equal(3);
  });

  it("inserts nothing for false", () => {
    const res = insert(false);
    expect(res.innerHTML).to.equal("beforeafter");
    expect(res.childNodes.length).to.equal(3);
  });

  it("inserts nothing for true", () => {
    const res = insert(true);
    expect(res.innerHTML).to.equal("beforeafter");
    expect(res.childNodes.length).to.equal(3);
  });

  it("inserts nothing for null in array", () => {
    const res = insert(["a", null, "b"]);
    expect(res.innerHTML).to.equal("beforeabafter");
    expect(res.childNodes.length).to.equal(5);
  });

  it("inserts nothing for undefined in array", () => {
    const res = insert(["a", undefined, "b"]);
    expect(res.innerHTML).to.equal("beforeabafter");
    expect(res.childNodes.length).to.equal(5);
  });

  it("inserts nothing for false in array", () => {
    const res = insert(["a", false, "b"]);
    expect(res.innerHTML).to.equal("beforeabafter");
    expect(res.childNodes.length).to.equal(5);
  });

  it("inserts nothing for true in array", () => {
    const res = insert(["a", true, "b"]);
    expect(res.innerHTML).to.equal("beforeabafter");
    expect(res.childNodes.length).to.equal(5);
  });

  it("can insert strings", () => {
    const res = insert("foo");
    expect(res.innerHTML).to.equal("beforefooafter");
    expect(res.childNodes.length).to.equal(4);
  });

  it("can insert a node", () => {
    const node = document.createElement("span");
    node.textContent = "foo";
    expect(insert(node).innerHTML).to.equal("before<span>foo</span>after");
  });

  it("can re-insert a node, thereby moving it", () => {
    var node = document.createElement("span");
    node.textContent = "foo";

    const first = insert(node),
      second = insert(node);

    expect(first.innerHTML).to.equal("beforeafter");
    expect(second.innerHTML).to.equal("before<span>foo</span>after");
  });

  it("can insert an array of strings", () => {
    expect(insert(["foo", "bar"]).innerHTML)
      .to.equal("beforefoobarafter", "array of strings");
  });

  it("can insert an array of nodes", () => {
    const nodes = [ document.createElement("span"), document.createElement("div")];
    nodes[0].textContent = "foo";
    nodes[1].textContent = "bar";
    expect(insert(nodes).innerHTML).to.equal("before<span>foo</span><div>bar</div>after");
  });

  it("can insert a changing array of nodes", () => {
    let container = document.createElement("div"),
      marker = container.appendChild(document.createTextNode("")),
      span1 = document.createElement("span"),
      div2 = document.createElement("div"),
      span3 = document.createElement("span"),
      current;
    span1.textContent = "1";
    div2.textContent = "2";
    span3.textContent = "3";

    current = h.insert(container, [], current, marker);
    expect(container.innerHTML).to.equal("");

    current = h.insert(container, [span1, div2, span3], current, marker);
    expect(container.innerHTML)
      .to.equal("<span>1</span><div>2</div><span>3</span>");

    current = h.insert(container, [div2, span3], current, marker);
    expect(container.innerHTML)
      .to.equal("<div>2</div><span>3</span>");

    current = h.insert(container, [div2, span3], current, marker);
    expect(container.innerHTML)
      .to.equal("<div>2</div><span>3</span>");

    current = h.insert(container, [span3, div2], current, marker);
    expect(container.innerHTML)
      .to.equal("<span>3</span><div>2</div>");

    current = h.insert(container, [], current, marker);
    expect(container.innerHTML)
      .to.equal("");

    current = h.insert(container, [span3], current, marker);
    expect(container.innerHTML)
      .to.equal("<span>3</span>");

    current = h.insert(container, [div2], current, marker);
    expect(container.innerHTML)
      .to.equal("<div>2</div>");
  });

  it("can insert nested arrays", () => {
    expect(insert(["foo", ["bar", "blech"]]).innerHTML)
      .to.equal("beforefoobarblechafter", "array of array of strings");
  });

  function insert(val) {
    const parent = container.cloneNode(true);
    h.insert(parent, val, undefined, parent.childNodes[1]);
    return parent;
  }
});
