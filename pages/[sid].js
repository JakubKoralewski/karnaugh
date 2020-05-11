import MyPresentation from "../presentation/presentation";
import slides from "../presentation/slides"
import {useRouter} from "next/router"

export default function Sid() {
    // https://nextjs.org/docs/routing/dynamic-routes
    const router = useRouter()
    let {sid} = router.query
    // console.log("slideID: ", sid)
    return (
        <MyPresentation slideID={sid ? parseInt(sid) : 0}/>
    )
}

// Needs to have empty static props for path generation to work
export async function getStaticProps() {
    return {
        props: {},
    }
}

// https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation
export async function getStaticPaths() {
    console.log("slides", slides)
    return {
        paths: slides.map((slide, i) => (
            {
                params: {
                    sid: i.toString()
                }
            }
          )
        ),
        fallback: false
    }
}
