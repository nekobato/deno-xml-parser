# deno-xml-parser
[Deno](https://github.com/denoland/deno) XML parser ported from [segmentio/xml-parser](https://github.com/segmentio/xml-parser)

## Usage

``` main.ts
import parse from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";

const node = parse("<foo>hello world</foo>");
console.log(node);
```

## License

MIT
