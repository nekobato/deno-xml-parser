import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import parse from "../index.ts";
const { test } = Deno

test("blankStrings", () => {
  const node = parse("");
  assertEquals(node, { declaration: undefined, root: undefined });
});

test("declarations", () => {
  const node = parse('<?xml version="1.0" ?>');
  assertEquals(node, {
    declaration: {
      attributes: {
        version: "1.0",
      },
    },
    root: undefined,
  });
});

test("comments", () => {
  const node = parse("<!-- hello --><foo></foo><!-- world -->");
  assertEquals(node.root, {
    name: "foo",
    attributes: {},
    children: [],
    content: "",
  });
});

test("tags", () => {
  const node = parse("<foo></foo>");
  assertEquals(node.root, {
    name: "foo",
    attributes: {},
    children: [],
    content: "",
  });
});

test("tagsWithText", () => {
  const node = parse("<foo>hello world</foo>");
  assertEquals(node.root, {
    name: "foo",
    attributes: {},
    children: [],
    content: "hello world",
  });
});

test("weirdWhitespace", () => {
  const node = parse("<foo \n\n\nbar\n\n=   \nbaz>\n\nhello world</\n\nfoo>");
  assertEquals(node.root, {
    name: "foo",
    attributes: { bar: "baz" },
    children: [],
    content: "hello world",
  });
});

test("tagsWithAttributes", () => {
  const node = parse(
    "<foo bar=baz some=\"stuff here\" whatever='whoop'></foo>"
  );
  assertEquals(node.root, {
    name: "foo",
    attributes: {
      bar: "baz",
      some: "stuff here",
      whatever: "whoop",
    },
    children: [],
    content: "",
  });
});

test("nestedTags", () => {
  const node = parse("<a><b><c>hello</c></b></a>");
  assertEquals(node.root, {
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
            content: "hello",
          },
        ],
        content: "",
      },
    ],
    content: "",
  });
});

test("tagsWithText", () => {
  const node = parse("<a>foo <b>bar <c>baz</c></b></a>");
  assertEquals(node.root, {
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
            content: "baz",
          },
        ],
        content: "bar ",
      },
    ],
    content: "foo ",
  });
});

test("selfClosingTags", () => {
  const node = parse('<a><b>foo</b><b a="bar" /><b>bar</b></a>');
  assertEquals(node.root, {
    name: "a",
    attributes: {},
    children: [
      {
        name: "b",
        attributes: {},
        children: [],
        content: "foo",
      },
      {
        name: "b",
        attributes: {
          a: "bar",
        },
        children: [],
      },
      {
        name: "b",
        attributes: {},
        children: [],
        content: "bar",
      },
    ],
    content: "",
  });
});

test("selfClosingTagsWithoutAttributes", () => {
  const node = parse("<a><b>foo</b><b /> <b>bar</b></a>");
  assertEquals(node.root, {
    name: "a",
    attributes: {},
    children: [
      {
        name: "b",
        attributes: {},
        children: [],
        content: "foo",
      },
      {
        name: "b",
        attributes: {},
        children: [],
      },
      {
        name: "b",
        attributes: {},
        children: [],
        content: "bar",
      },
    ],
    content: "",
  });
});

test("multilineComments", () => {
  const node = parse("<a><!-- multi-line\n comment\n test -->foo</a>");
  assertEquals(node.root, {
    name: "a",
    attributes: {},
    children: [],
    content: "foo",
  });
});

test("attributesWithHyphen", () => {
  const node = parse('<a data-bar="baz">foo</a>');
  assertEquals(node.root, {
    name: "a",
    attributes: {
      "data-bar": "baz",
    },
    children: [],
    content: "foo",
  });
});

test("tagsWithDot", () => {
  const node = parse(
    '<root><c:Key.Columns><o:Column Ref="ol1"/></c:Key.Columns><c:Key.Columns><o:Column Ref="ol2"/></c:Key.Columns></root>'
  );
  assertEquals(node.root, {
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
              Ref: "ol1",
            },
            children: [],
          },
        ],
        content: "",
      },
      {
        name: "c:Key.Columns",
        attributes: {},
        children: [
          {
            name: "o:Column",
            attributes: {
              Ref: "ol2",
            },
            children: [],
          },
        ],
        content: "",
      },
    ],
    content: "",
  });
});

test("tagsWithHyphen", () => {
  const node = parse(
    "<root>" +
      "<data-field1>val1</data-field1>" +
      "<data-field2>val2</data-field2>" +
      "</root>"
  );
  assertEquals(node.root, {
    name: "root",
    attributes: {},
    content: "",
    children: [
      {
        name: "data-field1",
        attributes: {},
        children: [],
        content: "val1",
      },
      {
        name: "data-field2",
        attributes: {},
        children: [],
        content: "val2",
      },
    ],
  });
});

test("Multiline comment at beginning", () => {
  const node = parse(`
    <!-- Test 
       Long comment
    -->
    <root>
      <data-field1>val1</data-field1>
      <data-field2>val2</data-field2>
    </root>`
  );
  assertEquals(node.root, {
    name: "root",
    attributes: {},
    content: "",
    children: [
      {
        name: "data-field1",
        attributes: {},
        children: [],
        content: "val1",
      },
      {
        name: "data-field2",
        attributes: {},
        children: [],
        content: "val2",
      },
    ],
  });
});
