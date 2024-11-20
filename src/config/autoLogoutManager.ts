/**
 * @author Dakota Soares
 * @version 1.1
 * @description Auto Logout Manager
 */

class AutoLogoutManager {
    private static timeoutId: NodeJS.Timeout | null = null;
  
    public static setTimeoutId(id: NodeJS.Timeout) {
      this.timeoutId = id;
    }
  
    public static clearTimeout() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }
  
  export default AutoLogoutManager;
  