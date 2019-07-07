import * as flatOffererController from "./flatOffererController"

export class FlatOffererRoute {
     public static routes(app): void {
          app.route("/flatofferer/:id").get(flatOffererController.getFlatofferer)
          app.route("/flatofferer").get(flatOffererController.getFlatofferers)
          app.route("/flatofferer").post(flatOffererController.addFlatofferer)
          app.route("/flatofferer/:id").patch(flatOffererController.updateUser)
          app.route("/flatofferer/:id").delete(flatOffererController.removeUser)
     }
}
