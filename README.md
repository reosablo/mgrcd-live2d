# mgrcd-live2d

Invite Magia Record characters to your mobile home screen or your desktop
wallpaper.

## What's this

This program generates Live2D models that works in
[Live2DViewerEX](https://store.steampowered.com/app/616720/Live2DViewerEX/).

Live2DViewerEX is not just a Live2D Viewer. It enables Live2D models to have
more powerful expressions; that's powerful enough to embed magireco characters'
behaviors like tap reactions into the models.

## Disclaimer

- Magia Record (magireco) is copyrighted by
  [©Magica Quartet/Aniplex・Magia Record Partners](https://magireco.com/)
- NEVER DISTRIBUTE generated data publicly. Enjoy for PRIVATE USE ONLY.
- This repository doesn't include any game contents.

## Usage

### Preparation

1. Install and launch magireco app to download the latest game contents locally
   - Optional download contents are not required.
1. Extract magireco game data files in
   `/data/data/com.aniplex.magireco/files/madomagi/resource/`
   - At least, files in `image_native/live2d_v4/`, `scenario/json/general/` and
     `sound_native/voice/` are required.
   - This step doesn't require magireco app running.
1. Decode HCA Audio into mp3 in `sound_native/voice/` directory
   - `vo_char_1001_00_01_hca.hca` should be converted into
     `vo_char_1001_00_01_hca.mp3`
1. Install [**Deno**](https://deno.land/) on your computer to run this program
1. Install **Live2DViewerEX** via
   [Steam](https://store.steampowered.com/app/616720/Live2DViewerEX/) or
   [Google Play Store](https://play.google.com/store/apps/details?id=com.pavostudio.live2dviewerex)

### Install

```sh
$ deno install -n mgrcd-live2d --allow-read --allow-write --unstable https://ghcdn.rawgit.org/reosablo/mgrcd-live2d/main/cli.ts
```

### Generate Live2D models

#### Generate Iroha Tamaki (School Uniform) model

```sh
$ mgrcd-live2d bake-ex-model 100101 --resource /path/to/resource
Generated: /path/to/resource/image_native/live2d_v4/100101/model-100100.model3.json
```

`100101` in input parameter is a model id of Iroha Tamaki (School Uniform). To
see all avaliable model ids, run `mgrcd-live2d list-model`.

`100100` in output filename is a scenario id of Iroha Tamaki's default behavior.
To see all avaliable scenario ids, run `mgrcd-live2d list-scenario`.

#### Generate Iroha Tamaki (School Uniform) model behaves like Christmas 2017 version

```sh
$ mgrcd-live2d bake-ex-model 100150 --cast 100100=100101 --resource /path/to/resource
Generated: /path/to/resource/image_native/live2d_v4/100101/model-100150.model3.json
```

`100150` in input parameter is a scenario id of Iroha Tamaki (2017 Christmas).

`--cast 100100=100101` describes mapping of chara id in scenario to model id. To
see all avaliable scenario ids, run `mgrcd-live2d list-chara $scenario_id`.

To be precise, `100101` in the former example is also a scenario id. scenario id
`100101` doesn't exist so falled back to `100100` and implicitly add parameter
like `--cast 100100=100101`.

#### Generate all models

```sh
$ mgrcd-live2d bake-ex-model --all --resource /path/to/resource
Generated: /path/to/resource/image_native/live2d_v4/100100/model-100100.model3.json
Generated: /path/to/resource/image_native/live2d_v4/100101/model-100100.model3.json
...
```

All model ids will be processed with no cast parameters.

### Load generated Live2D models into Live2DViewerEX

- https://live2d.pavostudio.com/doc/en-us/pc/quick-start/#load-model
- https://live2d.pavostudio.com/doc/en-us/android/manual/#model
