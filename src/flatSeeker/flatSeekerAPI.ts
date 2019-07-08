import * as flatSeekerController from "./flatSeekerController"

export class FlatSeekerRoute {
     public static routes(app): void {
          app.route("/flatseeker/:id").get(flatSeekerController.getUser)
          app.route("/flatseeker").get(flatSeekerController.getUsers)
          app.route("/flatseeker/").post(flatSeekerController.addFlatSeeker)
          app.route("/flatseeker/:id").patch(flatSeekerController.updateUser)
          app.route("/flatseeker/:id").delete(flatSeekerController.removeUser)
     }
}
