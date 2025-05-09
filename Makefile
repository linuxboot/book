build:
	mdbook build

run:
	mdbook serve

prepare:
	cargo install mdbook
	cargo install mdbook-mermaid
	mdbook-mermaid install
	cargo install mdbook-linkcheck
