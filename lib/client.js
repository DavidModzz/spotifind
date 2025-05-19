"use strict";

const fetch = global.fetch || require("node-fetch");
const localStorageExp = require("./localstorage.js");

class Client {
  /**
   * @param {Object} [opts] - Configuración de endpoints personalizados
   */
  constructor(opts = {}) {
    this.baseURL = opts.url || "https://api.spotify.com/v1";
    this.authURL = opts.auth || "https://accounts.spotify.com/api/token";
    this.consumer = opts.consumer || null;
    this.endpoints = {
      search: `${this.baseURL}/search`,
      playlists: `${this.baseURL}/playlists`,
      albums: `${this.baseURL}/albums`,
      artists: `${this.baseURL}/artists`,
      tracks: `${this.baseURL}/tracks`,
      browse: `${this.baseURL}/browse`,
      auth: this.authURL,
    };
  }

  /**
   * Realiza una solicitud GET a la API.
   * @param {string} path - URL o endpoint
   * @param {Object} [params] - Parámetros de consulta
   */
  async fetch(path, params) {
    if (params) {
      const searchParams = new URLSearchParams(params);
      path = `${path}?${searchParams.toString()}`;
    }
    const token = await this.getToken();
    const response = await fetch(path, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en la solicitud a ${path}: ${errorData.error?.message || response.statusText}`);
    }
    return response.json();
  }

  /**
   * Obtiene el token de autenticación, utilizando caché local.
   */
  async getToken() {
    if (!this.consumer) {
      throw new Error("No se han proporcionado las credenciales del cliente");
    }
    const { key, secret } = this.consumer;
    const encoded = Buffer.from(`${key}:${secret}`).toString("base64");

    const token = localStorageExp.load("token");
    if (token) return token;

    const bodyParams = new URLSearchParams({ grant_type: "client_credentials" });

    const response = await fetch(this.endpoints.auth, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error al obtener token: ${errorData.error_description || response.statusText}`);
    }
    
    const data = await response.json();
    localStorageExp.save("token", data.access_token, 50);
    return data.access_token;
  }

  /**
   * Realiza una búsqueda en Spotify.
   * @param {Object} params - Opciones para la búsqueda
   * @param {Function} [callback] - Función callback para manejar la respuesta
   */
  async search(params, callback) {
    if (params) {
      params.type = params.type || "artist,album,track";
    }
    try {
      const result = await this.fetch(this.endpoints.search, params);
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }

  /**
   * Obtiene un álbum o playlist.
   * @param {string} id - ID del álbum o playlist de Spotify
   * @param {Object} [opts] - Opciones adicionales
   * @param {Function} [callback] - Callback para manejar la respuesta
   */
  async getAlbum(id, opts = {}, callback) {
    let url;
    if (id.includes("playlist")) {
      url = `${this.endpoints.playlists}/${id.split("playlist/")[1]}`;
      if (opts.tracks) url += "/tracks";
    } else {
      const albumId = id.includes("album") ? id.split("album/")[1].split("?")[0] : id;
      url = `${this.endpoints.albums}/${albumId}`;
      if (opts.tracks) url += "/tracks";
    }
    try {
      const result = await this.fetch(url);
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }

  /**
   * Obtiene múltiples álbumes.
   * @param {Array} array_ids - Array de IDs de álbumes
   * @param {Function} [callback] - Callback para manejar la respuesta
   */
  async getAlbums(array_ids, callback) {
    const ids = array_ids.toString();
    try {
      const result = await this.fetch(this.endpoints.albums, { ids });
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }

  /**
   * Obtiene información de un artista.
   */
  async getArtist(id, opts = {}, callback) {
    let url = `${this.endpoints.artists}/${id}`;
    const country = opts.country || "SE";
    if (opts.albums) {
      url += "/albums";
      delete opts.albums;
    } else if (opts.topTracks) {
      url += "/top-tracks";
      delete opts.topTracks;
    } else if (opts.relatedArtists) {
      url += "/related-artists";
      delete opts.relatedArtists;
    }
    try {
      const result = await this.fetch(url, { ...opts, country });
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }

  /**
   * Obtiene múltiples artistas.
   */
  async getArtists(array_ids, callback) {
    const ids = array_ids.toString();
    try {
      const result = await this.fetch(this.endpoints.artists, { ids });
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }

  /**
   * Obtiene información de una pista.
   */
  async getTrack(id, callback) {
    const url = `${this.endpoints.tracks}/${id}`;
    try {
      const result = await this.fetch(url);
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }

  /**
   * Obtiene múltiples pistas.
   */
  async getTracks(array_ids, callback) {
    const ids = array_ids.toString();
    try {
      const result = await this.fetch(this.endpoints.tracks, { ids });
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }

  /**
   * Realiza navegación por diferentes endpoints de "browse".
   */
  async browse(params, callback) {
    const permitted = ["featured-playlists", "new-releases", "categories"];
    let url = this.endpoints.browse;
    if (params && permitted.includes(params.to)) {
      url += `/${params.to}`;
    }
    if (params) delete params.to;
    try {
      const result = await this.fetch(url, params);
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }

  /**
   * Obtiene información de una categoría o sus playlists.
   */
  async getCategory(id, opts = {}, callback) {
    let url = `${this.endpoints.browse}/categories/${id}`;
    if (opts.playlists) {
      url += "/playlists";
      delete opts.playlists;
    }
    try {
      const result = await this.fetch(url, opts);
      if (callback) return callback(null, result);
      return result;
    } catch (err) {
      if (callback) return callback(err);
      throw err;
    }
  }
}

module.exports = Client;