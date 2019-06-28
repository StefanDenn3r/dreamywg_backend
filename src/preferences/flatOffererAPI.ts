import * as flatOffererController from "./flatOffererController"

export class FlatOffererRoute {
     public static routes(app): void {
          app.route("/flatofferer/:id").get(flatOffererController.getUser)
          app.route("/flatofferer").get(flatOffererController.getUsers)
          app.route("/flatofferer/").post(flatOffererController.addUser)
          app.route("/flatofferer/:id").patch(flatOffererController.updateUser)
          app.route("/flatofferer/:id").delete(flatOffererController.removeUser)
     }
}
