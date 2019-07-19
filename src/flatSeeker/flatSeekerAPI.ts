import {FlatSeekerController} from "./flatSeekerController";

export class FlatSeekerRoute {
    public static routes(app): void {
        app.route("/flatseekers/loadSearchProperties").get(FlatSeekerController.loadSearchProperties);
        app.route("/flatseekers/search").post(FlatSeekerController.searchFlats);
        app.route("/flatseekers/:id").get(FlatSeekerController.getFlatSeeker);
        app.route("/flatseekers").get(FlatSeekerController.getFlatSeekers);
        app.route("/flatseekers").post(FlatSeekerController.createFlatSeeker);
        app.route("/flatseekers").delete(FlatSeekerController.deleteAllFlatSeekers)
    }
}
