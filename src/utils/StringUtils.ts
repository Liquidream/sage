export class StringUtils {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  /**
   * Select file(s).
   * @param {String} template string to parse
   * @param {Object} object structure with values for use in template
   * @returns {String} A promise of a file or array of files in case the multiple parameter is true.
   * https://stackoverflow.com/a/55594573/574415
   */
  public static inject(str, obj) {
    // https://stackoverflow.com/a/55594573/574415
    return str.replace(/\${(.*?)}/g, (x, g) => obj[g])
  }
}
