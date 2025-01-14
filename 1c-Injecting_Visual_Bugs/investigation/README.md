# `investigation`

This folder contains code used to help understand how visual bugs may be injected into PixiJS.

Use of the code in this folder (`investigation`) is entirely optional; it is not part of creating the visual bugs themselves.

Some of the API calls of this code are expensive (up to $0.86 USD), but each OpenAI API call has an estimated cost shown to help understand the cost before running the code with an OpenAI API call.

## `Understanding_Pixi.ipynb`

A chat conversation with a GenAI assistant provided with access to PixiJS repository files.
Emulated within a Jupyter Notebook.
Original chat model text responses are saved in markdown blocks beneath the respective code blocks.

## `chat_with_repo`

Code used to run a rudimentary GenAI assistant that can accept repository files as inputs while assisting with understanding PixiJS.
This code is used in the notebook `Understanding_Pixi.ipynb`.

## `understanding_pixi`

Files to create and display a call graph of PixiJS functions/methods.
The callgraph construction may not be fully functional, but the outputs still help to give some idea of how parts of PixiJS are interconnected.

To run this code, open a terminal from the root directory (`vlm_canvas_bugs-code`), then use the following npm scripts:

> [!NOTE] Assumes you have already downloaded the data from (bit.ly/vlm_canvas_bugs-data)[https://bit.ly/vlm_canvas_bugs-data] and placed it into the `Data` folder according to the instructions in the main README file.

```bash
# transpile the ts into js
npm run understanding_pixi:build

# (optional) run the call graph creation script
npm run understanding_pixi:create_call_graph

# serve the D3 app to view the call graph
npm run understanding_pixi:serve
```