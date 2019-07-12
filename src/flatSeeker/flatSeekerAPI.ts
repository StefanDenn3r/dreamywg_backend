import * as flatSeekerController from "./flatSeekerController"

export class FlatSeekerRoute {
    public static routes(app): void {
        app.route("/flatseekers/loadSearchProperties").get(flatSeekerController.loadSearchProperties);
        app.route("/flatseekers/search").post(flatSeekerController.searchFlats);
        app.route("/flatseekers/:id").get(flatSeekerController.getFlatSeeker);
        app.route("/flatseekers").get(flatSeekerController.getFlatSeekers);
        app.route("/flatseekers").post(flatSeekerController.addFlatSeeker)
        app.route("/flatseekers").delete(flatSeekerController.removeAllFlatSeekers)
    }
}
