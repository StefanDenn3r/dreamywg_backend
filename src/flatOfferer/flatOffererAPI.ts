import * as flatOffererController from "./flatOffererController"

export class FlatOffererRoute {
    public static routes(app): void {
        app.route("/flatofferers/:id").get(flatOffererController.getFlatOfferer)
        app.route("/flatofferers").get(flatOffererController.getFlatOfferers)
        app.route("/flatofferers").post(flatOffererController.addFlatOfferer)
        app.route("/flatofferers").delete(flatOffererController.removeAllFlatOfferers)
    }
}
