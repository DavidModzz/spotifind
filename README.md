# Spotifind

This is a client for the Spotify API that allows searching for artists, albums, tracks, and retrieving information about categories, playlists, and more.

## Installation

Before starting, make sure you have [Node.js](https://nodejs.org/) installed. Then, clone the repository and install dependencies:

```bash
npm install spotifind
````

## Configuration

To use the client, you need to obtain Spotify API credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

Example configuration:

```js
const Client = require("spotifind");

const spotify = new Client({
  consumer: {
    key: "YOUR_CLIENT_ID",
    secret: "YOUR_CLIENT_SECRET"
  }
});
```

## Available Methods

### `fetch(path, params)`

Makes an HTTP request to a Spotify endpoint.

- **`path`** _(string)_: The endpoint path.
- **`params`** _(Object, optional)_: Query parameters.

#### Example:

```js
spotify.fetch(spotify.endpoints.search, { q: "Coldplay", type: "artist" })
  .then(console.log)
  .catch(console.error);
```

---

### `search(params, callback)`

Searches for artists, albums, and tracks on Spotify.

- **`params`** _(Object)_:
    - `q` _(string, required)_: Search query.
    - `type` _(string, optional, default `"artist,album,track"`)_: Search type.
    - `limit` _(number, optional, default `20`)_: Number of results.
- **`callback`** _(Function, optional)_: Callback function.

#### Example:

```js
spotify.search({ q: "Daft Punk", type: "artist" })
  .then(console.log)
  .catch(console.error);
```

---

### `getAlbum(id, opts, callback)`

Retrieves information about an album or playlist.

- **`id`** _(string)_: Spotify ID of the album or playlist.
- **`opts`** _(Object, optional)_:
    - `tracks` _(boolean)_: If `true`, retrieves only the tracks.
- **`callback`** _(Function, optional)_: Callback function.

#### Example:

```js
spotify.getAlbum("3T4tUhGYeRNVUGevb0wThu")
  .then(console.log)
  .catch(console.error);
```

---

### `getAlbums(array_ids, callback)`

Retrieves multiple albums by their Spotify IDs.

- **`array_ids`** _(Array)_: List of album IDs.
- **`callback`** _(Function, optional)_: Callback function.

#### Example:

```js
spotify.getAlbums(["3T4tUhGYeRNVUGevb0wThu", "1ATL5GLyefJaxhQzSPVrLX"])
  .then(console.log)
  .catch(console.error);
```