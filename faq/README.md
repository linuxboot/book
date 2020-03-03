# F.A.Q.

This chapter contains the Frequently Asked Questions

## Troubleshooting

### Q: u-root dhcp client take ages, what is the problem ?

### A: the problem is a lack of early entropy:

1. If your platform has a hwrng enable it with `CONFIG_ARCH_RANDOM` and trust it with `CONFIG_RANDOM_TRUST_CPU`.
2. If your platform don't have hwrng, add `uroot.nohwrng` to your kernel command line so u-root use a non-blocking random implementation.


