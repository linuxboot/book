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

The book is linted with markdownlint and Vale. Follow the official
documentation to [install
markdownlint](https://github.com/markdownlint/markdownlint?tab=readme-ov-file#installation)
and [install Vale](https://vale.sh/docs/install). Then run `vale sync` to
download the necessary styles.

From the root directory of the repository run `mdl /src/example.md` and `vale
src/example.md`. Add words that trigger false positive spelling errors to
`ci/vale/styles/config/vocabularies/LinuxBoot/accept.txt`.

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
