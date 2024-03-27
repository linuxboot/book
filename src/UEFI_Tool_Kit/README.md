## UEFI Tool Kit

Authors: Ryan O'Leary, Gan Shun Lim and Andrea Barberio

In previous chapters, you learned how to read a raw ROM image from a flash
part. If you've been following along, you know the next step is to insert a
Linux kernel.

Inspecting and modifying ROM images is tricky and can involve a fair amount of
tinkering. These images typically contain a number of file systems, drivers,
tables, data structures and opaque blobs. They also differ significantly from the
UNIX model of a file systems, thus cannot be reasonably mounted in Linux.

UEFI Tool Kit (UTK) is intended to be a one-stop-shop for reading, writing and
modifying UEFI images -- the most common type of firmware image for x86
systems. UTK can parse a number of data structures including UEFI firmware
volumes, Intel firmware descriptors and FIT.

In this chapter, we'll go over how to:

1. Install UTK
2. Inspect ROMs
3. Modify ROMs
4. Common pitfalls
5. Extend UTK with additional commands

### Synopsis

    $ make bzImage
    $ sudo flashrom -r /tmp/ROM.bin
    $ utk /tmp/ROM.bin replace_pe32 Shell arch/86/boot/bzImage save /tmp/NEWROM.bin
    $ sudo flashrom -w /tmp/NEWROM.bin

### Quick start

We assume you have a way to read and write the FLASH into a file.

Let's assume you have read FLASH into an image called ROM.bin and you
have a kernel, called bzImage, which you want to insert into
ROM.bin. Be sure the kernel is buildable as an EFI driver (DXE); see
the pitfalls section. The easiest option is to replace the UEFI shell. This
is a quick and easy way to get started. In the long term, you want to
remove as much of UEFI as possible, but replacing the shell is always
our first step on a new board.

Get the tool:

    $ go get -u github.com/linuxboot/fiano/cmds/utk
    
 Replace the shell:
 
 	$ utk ROM.bin replace_pe32 Shell bzImage save NEWROM.bin

After that, you can flash NEWROM.bin and test. If anything goes wrong, such as not enough space, you will need to refer to the more detailed instructions below.

### Installation

At the time of writing, you must clone and build UTK from source -- binary
distributions are not officially available. The source code resides in the
Fiano project:

    https://github.com/linuxboot/fiano/

Aside: what is the difference between Fiano and UTK? The Fiano project contains
a few more tools besides UTK, but UTK is a big element.

We'll assume you already have Go installed. Check your installation with:

    $ go version
    go version go1.11 linux/amd64

Linux and the latest stable version of Go are recommended. Either download the
official binary distributions of Go or install from source. See
[https://golang.org/](https://golang.org/) for details.

With Go, download and install UTK:

    $ go get -u github.com/linuxboot/fiano/cmds/utk

Running the above line installs `utk` to your `$GOPATH/bin` directory (or
`$HOME/go/bin` if the `GOPATH` environment variable is not set). Adding this
directory to your `$PATH` is recommended.

Make sure it works with:

    $ utk -h
    Usage: utk [flags] <file name> [0 or more operations]

    Operations:
      cat                   : cat a file with a regexp that matches a GUID
      comment               : Print one arg
      count                 : count the number of each firmware type
      dump                  : dump a firmware file
      dxecleaner            : automates removal of UEFI drivers
      dxecleaner_blacklist  : automates removal of UEFI drivers with a blacklist file
      extract               : extract the files to a directory
      find                  : find a file by GUID or Name
      flatten               : prints a JSON list of nodes
      insert_after          : insert a file after another file
      insert_before         : insert a file before another file
      insert_end            : insert a file at the end of a firmware volume
      insert_front          : insert a file at the beginning of a firmware volume
      json                  : produce JSON for the full firmware volume
      remove                : remove a file from the volume
      remove_pad            : remove a file from the volume and replace it with a pad file of the same size
      repack                : repack a per file compressed fv to a nested compressed fv
      replace_pe32          : replace a pe32 given a GUID and new file
      save                  : assemble a firmware volume from a directory tree
      table                 : print out important information in a pretty table
      validate              : perform extra validation checks

Don't fret if your list of operations differs. UTK is an evolving project!


### Inspecting ROMs

Throughout this section, we'll demonstrate commands for inspecting a UEFI
image. When confronted with a new image, run these commands to get a "lay of
the land".

Start by downloading the UEFI image used in these examples:

    $ wget https://github.com/linuxboot/fiano/raw/master/integration/roms/OVMF.rom

Aside: alternatively, all UTK operations should work with your own UEFI images.
Simply substitute "OVMF.rom" with your own UEFI image in all the examples
below. If you encounter any problems, please file an issue at
[https://github.com/linuxboot/fiano/issues](https://github.com/linuxboot/fiano/issues).

First, it is advisable to print a count of each firmware element:

    $ utk OVMF.rom count
    {
            "FirmwareTypeCount": {
                    "BIOSRegion": 1,
                    "File": 118,
                    "FirmwareVolume": 5,
                    "Section": 365
            },
            "FileTypeCount": {
                    "EFI_FV_FILETYPE_APPLICATION": 2,
                    "EFI_FV_FILETYPE_DRIVER": 94,
                    "EFI_FV_FILETYPE_DXE_CORE": 1,
                    "EFI_FV_FILETYPE_FFS_PAD": 7,
                    "EFI_FV_FILETYPE_FIRMWARE_VOLUME_IMAGE": 1,
                    "EFI_FV_FILETYPE_FREEFORM": 3,
                    "EFI_FV_FILETYPE_PEIM": 7,
                    "EFI_FV_FILETYPE_PEI_CORE": 1,
                    "EFI_FV_FILETYPE_RAW": 1,
                    "EFI_FV_FILETYPE_SECURITY_CORE": 1
            },
            "SectionTypeCount": {
                    "EFI_SECTION_DXE_DEPEX": 44,
                    "EFI_SECTION_FIRMWARE_VOLUME_IMAGE": 2,
                    "EFI_SECTION_GUID_DEFINED": 1,
                    "EFI_SECTION_PE32": 99,
                    "EFI_SECTION_RAW": 21,
                    "EFI_SECTION_USER_INTERFACE": 99,
                    "EFI_SECTION_VERSION": 99
            }
    }

The definition of a "Firmware Element" is in order. Firmware images are
hierarchical and can be represented as a tree. Each node in the tree is a
"Firmware Element". Each element has a type such as "BIOSRegion",
"FirmwareVolume", "File" and "Section" as seen above. Files (and sections)
themselves have an additional type dictated by the UEFI spec. There are three
major file types you should be aware of:

- `EFI_FV_FILETYPE_DRIVER`: This is the most numerous file type and is often
  called a "DXE". They persist in memory even after their main function exits.
- `EFI_FV_FILETYPE_APPLICATION`: Applications do not persist in memory after
  exiting. For example, the EFI Shell is an EFI Application.
- `EFI_FV_FILETYPE_FIRMWARE_VOLUME_IMAGE`: These file types allow nesting
  firmware volumes. You will see this when an entire firmware volume is
  compressed.

TODO: Diagram showing a tree of these firmware elements.

To view a human-readable tree of all the firmware elements, types and sizes,
run:

    $ utk OVMF.rom table | less
    Node        GUID/Name                             Type                                   Size
    BIOS                                                                                     0x400000
     FV         FFF12B8D-7696-4C8B-A985-2747075B4F50                                          0x84000
      Free                                                                                        0x0
     FV         8C8CE578-8A3D-4F1C-9935-896185C32DD3                                         0x348000
      File      9E21FD93-9C72-4C15-8C4B-E77F1DB2D792  EFI_FV_FILETYPE_FIRMWARE_VOLUME_IMAGE  0x1256a7
       Sec                                            EFI_SECTION_GUID_DEFINED               0x12568f
        Sec                                           EFI_SECTION_RAW                            0x7c
        Sec                                           EFI_SECTION_FIRMWARE_VOLUME_IMAGE       0xe0004
         FV     8C8CE578-8A3D-4F1C-9935-896185C32DD3                                          0xe0000
          File  1B45CC0A-156A-428A-AF62-49864DA0E6E6  EFI_FV_FILETYPE_FREEFORM                   0x2c
           Sec                                        EFI_SECTION_RAW                            0x14
          File  FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF  EFI_FV_FILETYPE_FFS_PAD                    0x40
          File  52C05B14-0B98-496C-BC3B-04B50211D680  EFI_FV_FILETYPE_PEI_CORE                 0xc4fa
           Sec                                        EFI_SECTION_RAW                            0x3c
           Sec                                        EFI_SECTION_PE32                         0xc484
           Sec  PeiCore                               EFI_SECTION_USER_INTERFACE                 0x14
           Sec                                        EFI_SECTION_VERSION                         0xe
    ...

This format is compact and easy for humans reading, but not ideal for machine
consumption. Use the `json` command to print everything (including much more
metadata) as JSON:

    $ utk OVMF.rom json | less

Combine `utk` with the JSON query command, `jq` (`sudo apt-get install jq`),
and other UNIX commands to quickly write powerful queries. For example, the
following lists all the GUIDs, sorted and without duplicates:

    $ utk OVMF.rom json | jq -r '..|.GUID?|select(type=="string")' | sort -u
    00000000-0000-0000-0000-000000000000
    0167CCC4-D0F7-4F21-A3EF-9E64B7CDCE8B
    0170F60C-1D40-4651-956D-F0BD9879D527
    021722D8-522B-4079-852A-FE44C2C13F49
    025BBFC7-E6A9-4B8B-82AD-6815A1AEAF4A
    ...

To only print the JSON for specific files, use the find command:

    # The find command uses a regex to match on the name or GUID.
    # These three examples find and print the JSON for the same file:
    $ utk OVMF.rom find 'Sh.*'
    $ utk OVMF.rom find 'Shell'
    $ utk OVMF.rom find 7C04A583-9E3E-4F1C-AD65-E05268D0B4D1
    {
            "Header": {
                    "UUID": {
                            "UUID": "7C04A583-9E3E-4F1C-AD65-E05268D0B4D1"
                    },
                    "Type": 9,
                    "Attributes": 0
            },
            "Type": "EFI_FV_FILETYPE_APPLICATION",
            "Sections": [
                    {
                            "Header": {
                                    "Type": 21
                            },
                            "Type": "EFI_SECTION_USER_INTERFACE",
                            "ExtractPath": "",
                            "Name": "Shell"
                    },
                    ...
            ],
            "ExtractPath": "",
            "DataOffset": 24
    }

Note that UEFI uses GUIDs to identify files. Some files also have a name which
is stored within the file's UI section. Like `find`, most of UTKs commands let
you match a file by its name or GUID.

The examples up until now have only dealt with file metadata and not the file's
contents. The `extract <DIR>` command extracts all the files from the image and
saves them to `<DIR>`. `<DIR>/summary.json` lists all the paths to the extracted
files along with their metadata.

    $ utk OVMF.rom extract OVMF/

After modifying the files, they can be reassembled with:

    $ utk OVMF/ save OVMF2.rom

### Modifying ROMs

First, let's verify the image works by running it inside QEMU. This step is not
absolutely necessary, but gives us confidence the image works before and after
each change we make.

    $ qemu-system-x86_64 -bios OVMF.rom -nographic -net none

For the provided OVMF.rom image, this should boot to the EDK2 shell.

TODO: include screenshot of the EDK2 shell

Multiple commands can be used together to form a pipeline. The first argument
always loads the image into memory and the last argument typically writes the
output. The commands in between operate on the image in memory and are
reminiscent of a UNIX pipeline. The general syntax is:

    utk <IMAGE or DIR>                 \
      <COMMAND0> <ARG0_0> <ARG0_1> ... \
      <COMMAND1> <ARG1_0> <ARG1_1> ... \
      ...

To see the pipeline in action, we introduce two new commands:

- `remove <file GUID or NAME regex>`: Remove a file from a firmware volume. The
  search has the same semantics as `find`.
- `replace_pe32 <file GUID or NAME regex> <FILE>`: Replace the pe32 section of a
  file with the given file. The search has the same semantics as `find`. The
  file must be a valid pe32 binary.
- `save <FILE>`: Save the firmware image to the given file. Usually, this is the
  last command in a pipeline.

The following pipeline removes some unnecessary drivers (anything that starts
with Usb and the Legacy8259 driver which has the GUID
79ca4208-bba1-4a9a-8456-e1e66a81484e) and replaces the Shell with Linux. Often
you need to remove drivers to make room for Linux which makes the pipeline
convenient. This is the essence of LinuxBoot:

    $ stat linux.efi
    linux.efi: Linux kernel x86 boot executable bzImage, version 4.17.0
    $ utk OVMF.rom \
      remove 'Usb.*' \
      remove 79ca4208-bba1-4a9a-8456-e1e66a81484e \
      replace_pe32 Shell linux.efi \
      save OVMF2.rom

That's all there to it! Try experimenting with the other commands such as
insert.


### Common Pitfalls

#### Kernel is not built as a DXE or has not enabled UEFI stub mode

In order to be properly bootable as a DXE, kernels must have the following
enabled:

	CONFIG_EFI=y
	CONFIG_EFI_STUB=y

#### Files are missing from the Firmware Volume

When UTK does not recognize the compression format used by the particular
image, the files within it are not listed.

In the wild, three compression schemes are common:

| Compression  | GUID                                 | UTK Support               |
| ------------ | ------------------------------------ | ------------------------- |
| Uncompressed |                                      | Fully supported           |
| LZMA         | EE4E5898-3914-4259-9D6E-DC7BD79403CF | Fully supported           |
| LZMA + x86   | D42AE6BD-1352-4BFB-909A-CA72A6EAE889 | Supported, but not tested |
| Tianocore    | A31280AD-481E-41B6-95E8-127F4C984779 | Not supported, see [#226](https://github.com/linuxboot/fiano/issues/226) |

To determine which compression scheme you are using, search for the respective
GUID in the json summary.

#### File size too big!

    File size too big! File with GUID: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX has length 543210, but is only 123450 bytes big

When saving a UEFI image, files are added successively to each firmware volume.
The first file which overflows the volume's size causes this error.

If you were inserting files, you will need to delete existing files to make room.

There is a special cases where this error is generated without any operations:

    utk OVMF.rom save OVMF2.rom

How can this be? No changes should be made to the image!

Not quite (and the complete list of differences can be found in the "binary
equality section") -- compressed volumes are recompressed.

By default, UTK uses the Go compressor, which is generally worse than the
compression found in most UEFI images. Pass `--systemXZ=xz` as the first
argument to UTK to use a better compressor.

#### (TODO for everything after this point) Arbitrary data before or after the image.



Find a general solution which works for all images is a topic of research: [#200](https://github.com/linuxboot/fiano/issues/200).

#### Hard-coded addresses


#### Binary equality

TODO


### Extending UTK

Visitor pattern means decoupling the structure from the operations.

- pkg/uefi: structure
- pkg/visitors: operations

Good resources:

1. https://sourcemaking.com/design_patterns/visitor
2. https://en.wikipedia.org/wiki/Visitor_pattern

A good visitor still works when new Firmware are introduced. A good Firmware
still works when a new visitor is introduced.

**AST**

Abstract Syntax Tree -- this is a concept borrowed from compilers. When you're
extracting the DXE to create a tree of structs containing a simplified model,
you're essentially creating an AST. Then think about how patterns used in
compiler architecture might apply to UTK.

**Visitor Interface**

Each visitor implements the following:

```
type Visitor interface {
    VisitFV(*FV) error
    VisitFile(*File) error
    VisitSection(*FileSection) error
    // ...
}
```

Think of a visitor as an "action" or a "transformation" being applied on the
AST.

**Visitor**

A struct implementing Visitor performs a transformation on the AST, for example:

    type RenameDXE struct {
        before, after string
    }
    func (v *RenameDXE) VisitFV(fv *FV) error {
        // Recursively apply on files in the FV.
        for i := range fv.Files {
            fv.Files[i].Apply(v)
        }
        return nil
    }
    func (v *RenameDXE) VisitFile(f *File) error {
        if f.Type == FILETYPE_DXE && f.Name == v.before {
            f.Name = after
        }
        return nil
    }
    func (v *RenameDXE) VisitSection(s *FileSection) error {
        return nil
    }

You can imagine visitors being implemented for other actions, such as:

- Remove a DXE with the given GUID from the AST
- Replace a GUID with a file
- Validate that all the nodes in the tree are valid
- Find compressed files in the tree and decompress them
- Assembe the AST back into an image.
- Recursively write the AST to the filesystem (what you currently do with extract)
- Print an overview of the files to the terminal for debugging
- ...

It is easy to add more visitors without modifying existing code. Each action can
be in a separate file.

**Applying**

Visitors are applied to the AST. Each node in the AST has an "Apply" method, for
example:

```
func (f *File) Apply(v *visitor) error {
    return v.VisitFile(f)
}
```

This is so the visitors can be applied recursively over the AST.

To apply the above RenameDXE visitor, you'd run:

```
v := &RenameDXE{"Shell", "NotShell"}
fv.Apply(v)
```

**Chaining Visitors Together**

It would be exciting/useful to be able to chain these small actions together
through the command line. For example:

```
utk extract bios.rom \
    remove a2dad2a-adadad-a2d2-ad23a3 \
    remove 9d8cd98-d9c8d9-d9c8-9d8c8c \
    replaceDXEWithFile bab8a98-a9ba89a-9aba-a98a9 linux.efi \
    validate \
    save new_bios.rom
```

Again, it is easy to write new actions in Go which modify nodes in the AST.
Create a new file, new struct, and implement the visitFV/visitFile/visitSection
methods to modify the AST.

TODO: reference the UEFI spec.

TODO: mention alternatives

- binwalk
- fresh0r/romdump
- UEFITool
- uefi-firmware-parser
