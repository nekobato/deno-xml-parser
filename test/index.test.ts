import { test, assertEqual } from "https://deno.land/x/testing/testing.ts";
import parse from "../index.ts";

test(function blankStrings() {
  const node = parse("");
  assertEqual(node, { declaration: undefined, root: undefined });
});

test(function declarations() {
  const node = parse('<?xml version="1.0" ?>');
  assertEqual(node, {
    declaration: {
      attributes: {
        version: "1.0"
      }
    },
    root: undefined
  });
});

test(function comments() {
  const node = parse("<!-- hello --><foo></foo><!-- world -->");
  assertEqual(node.root, {
    name: "foo",
    attributes: {},
    children: [],
    content: ""
  });
});

test(function tags() {
  const node = parse("<foo></foo>");
  assertEqual(node.root, {
    name: "foo",
    attributes: {},
    children: [],
    content: ""
  });
});

test(function tagsWithText() {
  const node = parse("<foo>hello world</foo>");
  assertEqual(node.root, {
    name: "foo",
    attributes: {},
    children: [],
    content: "hello world"
  });
});

test(function weirdWhitespace() {
  const node = parse("<foo \n\n\nbar\n\n=   \nbaz>\n\nhello world</\n\nfoo>");
  assertEqual(node.root, {
    name: "foo",
    attributes: { bar: "baz" },
    children: [],
    content: "hello world"
  });
});

test(function tagsWithAttributes() {
  const node = parse("<foo bar=baz some=\"stuff here\" whatever='whoop'></foo>");
  assertEqual(node.root, {
    name: "foo",
    attributes: {
      bar: "baz",
      some: "stuff here",
      whatever: "whoop"
    },
    children: [],
    content: ""
  });
});

test(function nestedTags() {
  const node = parse("<a><b><c>hello</c></b></a>");
  assertEqual(node.root, {
    name: "a",
    attributes: {},
    children: [
      {
        name: "b",
        attributes: {},
        children: [
          {
            name: "c",
            attributes: {},
            children: [],
            content: "hello"
          }
        ],
        content: ""
      }
    ],
    content: ""
  });
});

test(function tagsWithText() {
  const node = parse("<a>foo <b>bar <c>baz</c></b></a>");
  assertEqual(node.root, {
    name: "a",
    attributes: {},
    children: [
      {
        name: "b",
        attributes: {},
        children: [
          {
            name: "c",
            attributes: {},
            children: [],
            content: "baz"
          }
        ],
        content: "bar "
      }
    ],
    content: "foo "
  });
});

test(function selfClosingTags() {
  const node = parse('<a><b>foo</b><b a="bar" /><b>bar</b></a>');
  assertEqual(node.root, {
    name: "a",
    attributes: {},
    children: [
      {
        name: "b",
        attributes: {},
        children: [],
        content: "foo"
      },
      {
        name: "b",
        attributes: {
          a: "bar"
        },
        children: []
      },
      {
        name: "b",
        attributes: {},
        children: [],
        content: "bar"
      }
    ],
    content: ""
  });
});

test(function selfClosingTagsWithoutAttributes() {
  const node = parse("<a><b>foo</b><b /> <b>bar</b></a>");
  assertEqual(node.root, {
    name: "a",
    attributes: {},
    children: [
      {
        name: "b",
        attributes: {},
        children: [],
        content: "foo"
      },
      {
        name: "b",
        attributes: {},
        children: []
      },
      {
        name: "b",
        attributes: {},
        children: [],
        content: "bar"
      }
    ],
    content: ""
  });
});

test(function multilineComments() {
  const node = parse("<a><!-- multi-line\n comment\n test -->foo</a>");
  assertEqual(node.root, {
    name: "a",
    attributes: {},
    children: [],
    content: "foo"
  });
});

test(function attributesWithHyphen() {
  const node = parse('<a data-bar="baz">foo</a>');
  assertEqual(node.root, {
    name: "a",
    attributes: {
      "data-bar": "baz"
    },
    children: [],
    content: "foo"
  });
});

test(function tagsWithDot() {
  const node = parse(
    '<root><c:Key.Columns><o:Column Ref="ol1"/></c:Key.Columns><c:Key.Columns><o:Column Ref="ol2"/></c:Key.Columns></root>'
  );
  assertEqual(node.root, {
    name: "root",
    attributes: {},
    children: [
      {
        name: "c:Key.Columns",
        attributes: {},
        children: [
          {
            name: "o:Column",
            attributes: {
              Ref: "ol1"
            },
            children: []
          }
        ],
        content: ""
      },
      {
        name: "c:Key.Columns",
        attributes: {},
        children: [
          {
            name: "o:Column",
            attributes: {
              Ref: "ol2"
            },
            children: []
          }
        ],
        content: ""
      }
    ],
    content: ""
  });
});

test(function tagsWithHyphen() {
  const node = parse(
    "<root>" +
      "<data-field1>val1</data-field1>" +
      "<data-field2>val2</data-field2>" +
      "</root>"
  );
  assertEqual(node.root, {
    name: "root",
    attributes: {},
    content: "",
    children: [
      {
        name: "data-field1",
        attributes: {},
        children: [],
        content: "val1"
      },
      {
        name: "data-field2",
        attributes: {},
        children: [],
        content: "val2"
      }
    ]
  });
});
