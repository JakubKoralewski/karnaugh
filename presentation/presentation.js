import {cloneElement} from "react"
import Presentation from "../components/presentation/presentation";
import slides from "./slides"

export default function MyPresentation(props) {
    return (
        <Presentation slideID={props.slideID ?? 0}>
            {
                slides.map((slide, i) => {
                    return cloneElement(slide, {key: i})
                })
            }
        </Presentation>
    )
}
