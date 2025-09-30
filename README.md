# The LinuxBoot Book

LinuxBoot is a project that aims to replace specific firmware functionality with
a Linux kernel and runtime. Over the years this project has grown to include
various initiatives with the overarching goal of moving from obscure, complex
firmware to simpler, open source firmware.

This is the official site of documentation for the LinuxBoot project. The book
provides guidance on how to get started, and gives overviews and
background on the different aspects of LinuxBoot.

## Contributing

This book is written with [mdBook](https://github.com/rust-lang/mdBook).
When installed, run `mdbook serve` and you will get a local webserver.
For more details, please refer to the mdBook documentation.

Some pages render diagrams using [mermaid.js](https://mermaid.js.org/), which is
preprocessed with [mdbook-mermaid](https://github.com/badboy/mdbook-mermaid).

To check that all links are still available, [mdbook-linkcheck](
https://github.com/Michael-F-Bryan/mdbook-linkcheck) also runs in CI.

For convenience, the `Makefile` lets you set up and run the environment:

```sh
make prepare
make run
```

The book is linted with markdownlint and Vale. Follow the official
documentation to [install
markdownlint](https://github.com/DavidAnson/markdownlint-cli2)
and [install Vale](https://vale.sh/docs/install). Then run `vale sync` to
download the necessary styles.

From the root directory of the repository run `mdl /src/example.md` and `vale
src/example.md`. Add words that trigger false positive spelling errors to
`ci/vale/styles/config/vocabularies/LinuxBoot/accept.txt`.

## I18n

Translations are in [`po/`](po/). They are built with [`i18n.sh`](i18n.sh).
Until there is a native mdBook plugin, see the [`Makefile`](Makefile) for how
the translations are integrated.

Note that `make run` / `mdbook serve` do not integrate the translations at this
point. The `make build` target will build everything into `book/`, which you
can then statically serve.

## Acknowledgments

In alphabetical order:

* [Andrea Barberio](https://github.com/insomniacslk)
* [Gan Shun Lim](https://github.com/ganshun)
* [Johnny Lin](https://github.com/johnnylinwiwynn)
* [Jonathan Zhang](https://github.com/jonzhang-fb)
* [Philipp Deppenwiese](https://github.com/zaolin)
* [Prachi Laud](https://github.com/pallaud)
* [Ronald Minnich](https://github.com/rminnich)
* [Ryan O'Leary](https://github.com/rjoleary)
