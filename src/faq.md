# Frequently asked questions

## Troubleshooting

**Why does the u-root DHCP client take ages?**

The problem is a lack of early entropy. If your platform has a hardware
random number generator then enable it with `CONFIG_ARCH_RANDOM` and trust it
with `CONFIG_RANDOM_TRUST_CPU`. Otherwise, add `uroot.nohwrng` to your kernel
command line so u-root use a non-blocking random number generator
implementation.
