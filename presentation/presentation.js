import {cloneElement} from "react"
import Presentation from "../components/presentation";
import slides from "./slides"

export default function MyPresentation(props) {
    return (
        <Presentation slideID={props.slideID ?? 0}>
            {
                slides.map((slide, i) => {
                    console.log("slide in presentation/presentation.js", slide)
                    return cloneElement(slide, {key: i})
                })
            }
        </Presentation>
    )
}