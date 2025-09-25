# gallery

A [gallery](https://jimkang.com/) of visual art, mostly in GLES.

Run with `make run`.

# Development

## Hue shift

The update loop is:

- onUpdate
- renderPieces
- showPieces
- showPieceInContainer
- updatePiece
- render (in this case, renderShader)
- <requestAnimationFrame>
- renderWithUpdatedTime
- setCustomUniforms
- <User changes a control>
- onControlChange
- onUpdate
