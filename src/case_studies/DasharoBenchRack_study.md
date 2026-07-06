# Dasharo BenchRack ASRock TURIND8UD-2T/X550

BenchRack is [3mdeb](https://3mdeb.com/)'s modular test-bench reference design
for open-source firmware development and validation.

This case study covers the
[Dasharo BenchRack ASRock TURIND8UD-2T/X550](https://docs.dasharo.com/variants/asrock_turind8ud/overview/) configuration,
in which the DUT boots with [coreboot](https://www.coreboot.org/) (as
distributed by 3mdeb) performing silicon initialization and LinuxBoot serving
as the payload, following the same LinuxBoot adoption approach described in the
[Ampere](Ampere_study.md) and [Google](Google_study.md) case studies.

It contains the following sections:

* [Reference design and goals](#reference-design-and-goals)
* [Platform overview](#platform-overview)
* [Firmware architecture](#firmware-architecture)
* [Build process](#build-process)
  * [Prerequisites](#prerequisites)
  * [Build the firmware image](#build-the-firmware-image)
* [Flashing and operation](#flashing-and-operation)
* [Booting with LinuxBoot](#booting-with-linuxboot)
* [Support](#support)
  * [Hardware support](#hardware-support)
  * [Community support](#community-support)
  * [Professional support](#professional-support)
* [See also](#see-also)

## Reference design and goals

BenchRack is intended as a reference design, not a one-off test rig. By
standardizing how a DUT is powered, flashed, and observed, it serves several
business and engineering goals:

* **Compliance optimization showcasing** — demonstrating how an open firmware
  stack can be tuned and evidenced to meet compliance and certification
  requirements.
* **Firmware due diligence and patching loop** — providing a repeatable
  environment to audit firmware, reproduce issues, and validate patches in a
  tight build-flash-test loop.
* **Decomposition of complex rack systems** — breaking a complex rack system
  into individually manageable components, enabling a divide-and-conquer
  strategy for reasoning about and validating large systems.

Because BenchRack is defined by this control-and-validation harness rather than
by a specific board, future BenchRack configurations may host entirely
different motherboards. This case study documents the ASRock TURIND8UD-2T/X550
configuration.

## Platform overview

The device under test (DUT) in this configuration is the
[ASRock Rack TURIND8UD-2T/X550](https://docs.dasharo.com/variants/asrock_turind8ud/overview/),
a single-socket AMD EPYC server board:

* **CPU**: single socket SP5 (LGA 6096), supporting AMD EPYC 9005 series
  processors.
* **Memory**: 8 DDR5 RDIMM slots (1 DIMM per channel).
* **Expansion**: 4 PCIe 5.0 slots and 2 M.2 (PCIe 5.0 NVMe) slots.
* **Networking**: onboard 10 GbE.

The DUT is mounted in a BenchRack, which supplies remote power control, firmware
flashing, and serial capture so the board can be validated automatically. Both
silicon initialization (coreboot) and the payload (LinuxBoot) are open source,
though — as on most modern x86 platforms — a few binary blobs are still required
for silicon initialization (for example AMD PSP firmware and microcode). This
places the platform at the most advanced practical stage of the LinuxBoot
adoption model described in the [Ampere](Ampere_study.md) case study.

## Firmware architecture

The boot firmware for the DUT is largely open source, with a few binary blobs
required for silicon initialization:

* **coreboot**: performs early hardware and silicon initialization. Source is
  available at [Dasharo/coreboot](https://github.com/Dasharo/coreboot.git). It
  incorporates a small number of vendor binary blobs (such as AMD PSP firmware
  and CPU microcode) that are needed to bring up the silicon.
* **LinuxBoot**: built as the coreboot payload (u-root initramfs +
  [flashkernel](../glossary.md)), responsible for boot device selection and
  `kexec` into the target OS.

## Build process

The firmware image is a single `coreboot.rom` containing coreboot plus the
LinuxBoot payload.

### Prerequisites

The recommended, reproducible build path uses the Dasharo/coreboot SDK
container, which pins the toolchain and build dependencies.

```bash
git clone https://github.com/Dasharo/coreboot.git
cd coreboot
git checkout asrock_turind8ud_linuxboot_v0.9.0
git submodule update --init --checkout
```

You must also obtain and extract blobs necessary for memory and silicon
initialization. Please familiarize yourself with the [Dasharo terms of service](https://www.dasharo.com/pages/terms/),
then download and extract them:

```bash
wget https://dl.3mdeb.com/open-source-firmware/Dasharo/gigabyte_mz33_ar1/uefi/v0.9.0/Turin.zip
unzip Turin.zip -d 3rdparty/blobs/soc/amd/
```

Enter the Dasharo SDK container:

```bash
# Enter the pinned Dasharo SDK container
docker run --rm -it \
  -v "$PWD:/home/coreboot/coreboot" \
  -w /home/coreboot/coreboot \
  ghcr.io/dasharo/dasharo-sdk:v1.9.2 \
  /bin/bash
```

### Build the firmware image

From inside the SDK container:

```bash
# Select the BenchRack DUT board target and the LinuxBoot payload
./build.sh asrock_turind8ud_linuxboot
```

The resulting flashable image is at `asrock_turind8ud_linuxboot_<version>.rom`.

## Flashing and operation

BenchRack provides remote flashing, power control, and serial capture for each
DUT, enabling automated (CI) firmware deployment and testing. These are driven
by [benchctl](https://github.com/zarhus/benchctl), a single command-line tool
that controls the bench from a workstation or from the bench itself. For
BenchRack it operates the [Remote Test Environment (RTE)](https://docs.dasharo.com/transparent-validation/rte/v1.1.0/specification/),
driving the GPIO lines, the SPI mux, and host power through the RTE REST API and
running `flashrom` over SSH — so the low-level SPI sequencing no longer has to be
performed by hand.

Select the BenchRack platform and DUT through flags (or the matching
`BENCHCTL_*` environment variables). The `benchrack` platform defaults to the
`asrock-turin` board profile, so `--board` can be omitted for this DUT. When run
from a workstation, `--host` points at the RTE by IP or hostname; run directly on
the RTE, the host is implied and the flag is dropped.

To flash the host boot flash with the image built above:

```bash
# From a workstation, targeting the RTE:
benchctl --host <RTE-IP> \
  flash host ./asrock_turind8ud_linuxboot_<version>.rom
```

`benchctl` checks the firmware size, copies it to the RTE with `scp`, takes
control of the SPI bus, runs the blocking flash, confirms it succeeded, and
cleans up the temporary file. Power and serial console are managed through the
same tool:

```bash
benchctl --host <RTE-IP> power reset   # power-cycle the DUT
benchctl --host <RTE-IP> console       # attach to serial
```

## Booting with LinuxBoot

On power-on, the DUT runs coreboot, hands off to the LinuxBoot payload, boots
into u-root, and `kexec`s into the target OS.

```text
Welcome to LinuxBoot's Menu

Enter a number to boot a kernel:

01. Ubuntu

02. Ubuntu, with Linux 7.0.0-27-generic

03. Ubuntu, with Linux 7.0.0-27-generic (recovery mode)

04. Ubuntu, with Linux 7.0.0-22-generic

05. Ubuntu, with Linux 7.0.0-22-generic (recovery mode)

06. Memory test (mt86+x64)

07. Memory test (mt86+x64)

08. Memory test (mt86+x64, serial console)

09. Memory test (mt86+x64, serial console)

10. Memory test (mt86+ia32)

11. Memory test (mt86+ia32)

12. Memory test (mt86+ia32, serial console)

13. Memory test (mt86+ia32, serial console)

14. Reboot

15. Enter a LinuxBoot shell


Enter an option ('01' is the default, 'e' to edit kernel cmdline):
 >

Attempting to boot LinuxImage(
  Name: Ubuntu
  Kernel: file:///tmp/u-root-mounts1460215710/nvme0n1p2/boot/vmlinuz-7.0.0-27-generic
  Initrd: file:///tmp/u-root-mounts1460215710/nvme0n1p2/boot/initrd.img-7.0.0-27-generic
  Cmdline: root=UUID=d6f381c6-1549-4560-87e9-f26d9e317ab1 ro quiet splash crashkernel=2G-4G:320M,4G-32G:512M,32G-64G:1024M,64G-128G:2048M,128G-:4096M console=ttyS0,115200
  DTB: <nil>
)
```

## Support

### Hardware support

Hardware support is provided by [3mdeb](https://3mdeb.com/), and BenchRack units
are available from the [3mdeb shop](https://shop.3mdeb.com/product/benchrack-asrock-turind8ud-2t-x550-with-dasharo-pro-package-for-servers/).

### Community support

* [Dasharo community](https://docs.dasharo.com/#community) — documentation and
  matrix chat channels.
* [LinuxBoot open source community](https://www.linuxboot.org/) — Slack, IRC,
  mailing list, and regular meetings for technical questions.

### Professional support

Professional support services are provided by [3mdeb](https://3mdeb.com/).

## See also

* [Dasharo documentation](https://docs.dasharo.com/)
* [Dasharo RTE specification](https://docs.dasharo.com/transparent-validation/rte/v1.1.0/specification/)
