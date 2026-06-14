# Toolchain Baseline

This project pins its initial Neverwinter Nights: Enhanced Edition module workflow to the following baseline:

- NWN:EE: one exact `89.8193.37` stable micro-build, chosen by the team and documented in release notes.
- Module editor: Aurora Toolset from the pinned NWN:EE install.
- Build tooling: Nasher `1.1.2`, neverwinter.nim `2.1.2`, NWNT `1.4.0`.
- Art tooling: Blender `4.0.0` and NeverBlender `4.1.0`.
- Texture tooling: GIMP `3.2.4`, with NVIDIA Texture Tools Exporter `2024.1.1` optional for DDS output.

Contributors should not upgrade the game build, Blender, NeverBlender, or Nasher independently. Propose toolchain changes through normal review so the team can test the authoring, build, and runtime impact together.
