# Netboot NixOS from u-root in QEMU

The goal is to netboot a Linux distribution from u-root. This tutorial uses
NixOS, but the approach applies to any distribution that publishes a netboot
image and iPXE script (which you can create manually).

The obstacle is networking. The [u-root demo with QEMU](u-root-qemu-demo.md)
boots a prebuilt initramfs and an Arch kernel, but `dhclient` finds no
interface: the Arch kernel ships every NIC driver as a loadable module and the
stock u-root image carries none. To get around this, this demo adds the `e1000`
module to u-root without repacking it or building a kernel. In production, you
should use a custom kernel with built-in network drivers.

## Get the u-root image and kernel

You start with the same two downloads as the u-root demo with QEMU. You can skip
this step if you've already done it:

```bash
curl -L -o u-root.cpio.xz https://github.com/linuxboot/u-root-builder/releases/download/v0.0.1/u-root_amd64_all.cpio.xz
curl -L -o linux.tar.zst https://archlinux.org/packages/core/x86_64/linux/download/
tar -xf linux.tar.zst
```

## Add the e1000 module to u-root

- Decompress the `e1000.ko.zst` module.

  ```bash
  zstd -o e1000.ko -d usr/lib/modules/*/kernel/drivers/net/ethernet/intel/e1000/e1000.ko.zst
  ```

- Pack it into its own `cpio` archive.

  ```sh
  echo "e1000.ko" | cpio -o -H newc >modules.cpio
  ```

- Combine both archives. Concatenation is enough.

  ```sh
  cat modules.cpio u-root.cpio.xz >u-root-e1000.cpio
  ```

  > If you want to use `virtio-net` network device instead of `e1000` you have
  > to add and later load different modules in that order: `failover.ko`,
  > `net_failover.ko`, `virtio_net.ko` (first two are dependencies of
  > `virtio_net`).

## Get the NixOS netboot files

- Download the NixOS kernel, initrd, and netboot iPXE script.

  ```bash
  REL=https://github.com/nix-community/nixos-images/releases/download/nixos-26.05
  curl -L -O "$REL/netboot-x86_64-linux.ipxe"
  curl -L -O "$REL/bzImage-x86_64-linux"
  curl -L -O "$REL/initrd-x86_64-linux"
  ```

- Replace remote `https` links with local paths. You can do it manually or use
  `sed` to strip the `$REL/` prefix.

  ```sh
  sed -i "s@$REL/@@g" netboot-x86_64-linux.ipxe
  ```

  > `pxeboot` fetches only `http`, `tftp`, and `file` URLs. It registers no
  > `https` scheme, so an `https://` URL fails with an unknown-scheme error.
  > That's why in this demo those files will be served from the host.

## Serve the files over HTTP

Run an HTTP server that serves the requested files.

```bash
python3 -m http.server 8000
```

## Boot u-root

NixOS is quite slow to boot without KVM and needs at least 2 GB of guest RAM, so
boot with KVM enabled, `-cpu host`, and `-m 2G`. Run this in another terminal as
the previous one is busy running the HTTP server:

```bash
qemu-system-x86_64 -enable-kvm -cpu host -m 2G -machine q35 -nographic \
  -append "console=ttyS0" \
  -kernel usr/lib/modules/*/vmlinuz -initrd u-root-e1000.cpio \
  -netdev user,id=net0 -device e1000,netdev=net0
```

> `-cpu host` is required: without it `dhclient` hangs forever and never gets a
> lease. On a host without KVM, use `-cpu max` instead (and expect a slow NixOS
> boot).

## Netboot NixOS

- Load the network driver when booted into the u-root shell.

  ```sh
  insmod /e1000.ko
  ```

- Configure network via DHCP:

  ```sh
  dhclient -ipv6=false
  ```

  > `pxeboot -file` skips DHCP, so the explicit `dhclient` first is required to
  > configure the network interface. In a production environment, if you have
  > configured your DHCP server to serve e.g. `Bootfile Name` or
  > `Next server`/`TFTP Server` then you can just use `pxeboot` directly without
  > adding `-file`, just as traditional PXE via DHCP.

- And finally boot NixOS

  ```sh
  pxeboot -file http://10.0.2.2:8000/netboot-x86_64-linux.ipxe -cmd "console=ttyS0,115200"
  ```

  > Under QEMU user networking, the host is reachable from the guest at
  > `10.0.2.2`.
  >
  > The `-cmd` argument appends to the kernel command line. This is needed so we
  > get output on the serial console.

  You should see:

  ```text
  Welcome to LinuxBoot's Menu

  Enter a number to boot a kernel:

  01. Linux(kernel=bzImage-x86_64-linux initrd=http://10.0.2.2:8000/initrd-x86_64-linux)
  02. Reboot
  03. Enter a LinuxBoot shell

  Enter an option ('01' is the default, 'e' to edit kernel cmdline):
  >
  ```

  You can press enter or wait a couple of seconds for it to autoboot. If you've
  done everything correctly you should see:

  ```text
  <<< Welcome to NixOS kexec-26.05beta-295941.gfedcba (x86_64) - ttyS0 >>>
  The "nixos" and "root" accounts have empty passwords.

  To log in over ssh you must set a password for either "nixos" or "root"
  with `passwd` (prefix with `sudo` for "root"), or add your public key to
  /home/nixos/.ssh/authorized_keys or /root/.ssh/authorized_keys.

  To set up a wireless connection, run `nmtui`.


  nixos login: nixos (automatic login)


  [nixos@nixos:~]$
  ```

## u-root's iPXE support

u-root's `pxeboot` ships a deliberately minimal iPXE parser
([`pkg/boot/netboot/ipxe`](https://github.com/u-root/u-root/blob/main/pkg/boot/netboot/ipxe/ipxe.go)).
It supports only three commands:

- `kernel <path> [args...]` — the kernel image, with any trailing tokens joined
  onto the kernel command line.
- `initrd <path>` — the initrd.
- `boot` — boot the loaded kernel.

The script must begin with `#!ipxe`. Every other iPXE command (`set`, `chain`,
`menu`, `dhcp`, `imgargs`, and so on) is skipped with an
`Ignoring unsupported ipxe cmd` log line, and there is no variable expansion.
The NixOS script's `kernel` line ends with a `${cmdline}` token for
chainloading, which u-root passes through literally. The kernel ignores it, so
it is harmless.
