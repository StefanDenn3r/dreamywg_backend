import {FlatOffererController} from "./flatOffererController"

export class FlatOffererRoute {
    public static routes(app): void {
        app.route("/flatofferers/:id").get(FlatOffererController.getFlatOfferer);
        app.route("/flatofferers").get(FlatOffererController.getFlatOfferers);
        app.route("/flatofferers").post(FlatOffererController.createFlatOfferer);
        app.route("/flatofferers").delete(FlatOffererController.deleteAllFlatOfferers)
    }
}
