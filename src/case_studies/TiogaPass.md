# OCP TiogaPass Case Study

Points of contact:
[Jonathan Zhang](https://github.com/jonzhang-fb),
[Andrea Barberio](https://github.com/insomniacslk),
[David Hendricks](https://github.com/dhendrix),
[Adi](https://github.com/agangidi53),
[Morgan Jang](https://github.com/morganjangwiwynn),
[Johnny Lin](https://github.com/johnnylinwiwynn)

This case study describes information for firmware development community to use
[OCP](https://www.opencompute.org/) platform TiogaPass, made by [Wiwynn
Corporation](http://www.wiwynn.com/english).

It contains following sections:

* [Quick Start](#quick-start)
* [Details](#details)
  * [How to build](#how-to-build)
  * [How to operate](#how-to-operate)
  * [Platform info](#platform-info)
* [Support](#support)
  * [Hardware support](#hardware-support)
  * [Community support](#community-support)
  * [Professional support](#professional-support)

## Quick Start

* [Order the hardware](http://www.wiwynn.com/english) if you have not done so.
* Download or build the firmware binary. The current solution is to boot
  embedded Linux kernel and initramfs as UEFI payload. Please contact Wiwynn to
  get a UEFI binary after ordering.
* Flash the firmware.
  * Copy the downloaded firmware to OpenBMC.
  * From OpenBMC

    ```
      fw-util mb --update bios --force ./<firmware image name>
    ```

* Boot and enjoy.
  * From OpenBMC

    ```
      power-util mb reset
      sol-util mb
    ```

## Details

### How to build

Follow [Build Details](#build-details) for details on how to get the source
code, and how to build.

Boot flow of the current firmware solution is: Power on → minimized UEFI →
LinuxBoot → target OS.

In near feature, the boot flow will be: power on → Coreboot → LinuxBoot →
target OS.

#### Build Details

* Download the code from [linuxboot github](https://github.com/linuxboot/linuxboot)

  ```
    git clone https://github.com/linuxboot/linuxboot.git
  ```

* You need to apply Wiwiynn's linuxboot patch for now

  ```
  cd linuxboot
  wget -O TiogaPass.patch https://github.com/johnnylinwiwynn/linuxboot/commit/28ae8450b3b05c6e6b8c74e29d0974ccf711d5e6.patch
  git am TiogaPass.patch
  ```

* Build the kernel bzImage (has embedded initramfs) for linuxboot, please
  reference [Building u-root](https://github.com/linuxboot/book/tree/master/coreboot.u-root.systemboot#building-u-root)
  and [Building a suitable Linux kernel](https://github.com/linuxboot/book/tree/master/coreboot.u-root.systemboot#building-a-suitable-linux-kernel)
  for how to build the bzImage. You can always customize your Linux kernel
  configuration to suit your needs, please reference Wiwynn's kernel
  configuration file as a sample [linux_config](linux_config).
* Place the tioga.rom into linuxboot/boards/tioga which is provided from Wiwynn
  after ordering, and also put your bzImage to the root folder of linuxboot,
  and then make

  ```
    cp path/to/tioga.rom linuxboot/boards/tioga
    cp path/to/bzImage linuxboot
    cd linuxboot
    BOARD=tioga make
  ```

* You should see the built image at build/tioga/linuxboot.rom.

### How to operate

Follow **TBD section** for details on:

* How to flash. The image can be flashed either out-of-band, or from LinuxBoot
  u-root shell, or from targetOS shell.
* How to run LinuxBoot u-root shell commands.

### Platform info

The SKU contains TiogaPass board, a debug card, a VGA card, a power adapter.
The details can be obtained from the [Wiwynn Corporation](http://www.wiwynn.com/english).

Platform design details (including the design spec and schematics) can be found
on the [Open Compute Project UfiSpace product
page](https://www.opencompute.org/products/108/wiwynn-tioga-pass-standard-sv7220g3-s-2u-ocp-server-up-to-768gb-8gb16gb32gb-ddr4-up-to-2666mts-12-dimm-slots).

## Support

### Hardware support

Hardware support can be obtained from [Wiwynn Corporation](http://www.wiwynn.com/english).

### Community support

[OCP Open System Firmware](https://www.opencompute.org/projects/open-system-firmware)
is where industry collaborates on how to move forward with OSF. The OCP OSF
project has regular recorded meetings and a mailing list.

[LinuxBoot open source community](https://www.linuxboot.org/) is the community
you can ask any technical questions. LinuxBoot community has a slack channel, a
IRC channel, a mailing list and regular meetings.

### Professional support

Following companies provides professional support services:

**TBD**
