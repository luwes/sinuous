---
title: Does Sinuous use VDOM rendering?
weight: 20
---

No, Sinuous doesn't use <abbr title="Virtual DOM">VDOM</abbr> in the classical sense. Only the [`map`]({{< relref "/main-concepts/lists.md" >}}) module performs a diffing algorithm that is somewhat similar.

For the dynamic parts of the view Sinuous makes use of a simple but powerful [observable]({{< relref "/advanced/observable.md" >}}) which enables fine-grained updates in the exact precision that is defined in the view. This way only the parts that change are evaluated, there is no need to compare whole DOM trees.
