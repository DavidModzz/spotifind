"use strict";

const path = require("path");
const { LocalStorage } = require("node-localstorage");
const localStorage = global.localStorage || new LocalStorage(path.join(__dirname, "store"));

class LocalStorageExp {
  /**
   * Guarda un dato en el almacenamiento local con expiración.
   * @param {string} key - Nombre de la clave
   * @param {any} jsonData - Dato a guardar
   * @param {number} expirationMin - Tiempo de expiración en minutos
   */
  save(key, jsonData, expirationMin) {
    const expirationMS = expirationMin * 60 * 1000;
    const record = {
      value: JSON.stringify(jsonData),
      timestamp: Date.now() + expirationMS,
    };
    localStorage.setItem(key, JSON.stringify(record));
  }

  /**
   * Carga un dato del almacenamiento local.
   * @param {string} key - Nombre de la clave
   */
  load(key) {
    const recordStr = localStorage.getItem(key);
    if (!recordStr) return false;
    let record;
    try {
      record = JSON.parse(recordStr);
    } catch (e) {
      return false;
    }
    if (Date.now() < record.timestamp) {
      return JSON.parse(record.value);
    }
    return false;
  }

  /**
   * Elimina una clave del almacenamiento local.
   * @param {string} key - Nombre de la clave a eliminar
   */
  remove(key) {
    localStorage.removeItem(key);
  }
}

module.exports = new LocalStorageExp();