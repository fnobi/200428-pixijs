import Sample from "@/lib/Sample";
import { BASE_DIR } from "~/constants.yml";

import "~/scss/style.scss";

const sample = new Sample({
  name: "world"
});

const wrapper = document.querySelector(".wrapper");
if (wrapper) {
  wrapper.addEventListener("click", () => {
    console.log(`hello, ${sample.name}. Base directory is ${BASE_DIR}.`);
  });
}
