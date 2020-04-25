---
title: Does Sinuous use VDOM rendering?
order: 2
tags: faq
layout: layouts/docs.njk
---

No, Sinuous doesn't use <abbr title="Virtual DOM">VDOM</abbr> in the classical sense. Only the [`map`](/docs/lists) module performs a diffing algorithm that is somewhat similar.

For the dynamic parts of the view Sinuous makes use of a simple but powerful [observable](/docs/observable) which enables fine-grained updates in the exact precision that is defined in the view. This way only the parts that change are evaluated, there is no need to compare whole DOM trees.
