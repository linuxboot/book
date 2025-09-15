all
# This should be 2 by default per the docs, but turned out to be 8
rule 'MD007', :indent => 2
# Ignore line length in code blocks and tables
rule 'MD013', :ignore_code_blocks => true, :tables => false
# Allow inline HTML
exclude_rule 'MD033'
# Order ordered lists
rule 'MD029', :style => :ordered
