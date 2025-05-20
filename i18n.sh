#!/bin/sh

# Update the language picker in theme/js/language-picker.js to add new languages.
LANGUAGES=zh-TW

for po_lang in ${LANGUAGES}; do
  echo "::group::Building $po_lang translation"
  MDBOOK_BOOK__LANGUAGE=$po_lang \
  MDBOOK_OUTPUT__HTML__SITE_URL=/linuxboot-book/$po_lang/ \
  mdbook build -d book/$po_lang
  # NOTE: This is crucial. Put the files in the right place.
  rsync -a book/$po_lang/html/ book/$po_lang/
  echo "::endgroup::"
done
