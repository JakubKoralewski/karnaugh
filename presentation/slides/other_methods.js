import styles from './slides.module.scss'
import React from "react"
import {BasicAnimation, ScrollIntoViewAnimation, SimpleOpacityAnimation} from "../animations"
import technicalStyles from "./technical_implementation/styles.module.scss"
import {AnimatePresence, motion} from "framer-motion";
import Code from "./technical_implementation/code"

const steps = 2

function OtherMethods(props) {
    return (
        <div className={[styles.titular, technicalStyles.slide, styles.otherMethods].join(' ')}>
            <BasicAnimation>
                <h2>Other methods</h2>
            </BasicAnimation>
            <SimpleOpacityAnimation>
                <main>
                    <section>

                        <motion.p animate={{opacity: 1}} initial={{opacity: 0}} transition={{delay: 0.1}}>
                            Minimizing Boolean functions by hand using the classical Karnaugh maps is a laborious,
                            tedious and error prone process. It isn't suited for more than six input variables and
                            practical only for up to four variables.
                        </motion.p>
                        <motion.p animate={{opacity: 1}} initial={{opacity: 0}} transition={{delay: 0.5, duration: 2}}>
                            <strong title="🤣🤣🤣🤣 EPICO">
                                This method doesn't lend itself to be automated in the form of a computer
                                program.
                            </strong> Since modern logic functions are not constrained
                            to such a small number of
                            variables, the use of computers became indispensable.
                        </motion.p>
                    </section>
                    {
                        props.step >= 1 &&
                        <section>
                            <h3><a
                                href="https://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm">
                                Quine-McCluskey algorithm
                            </a></h3>

                            <motion.p animate={{opacity: 1}} initial={{opacity: 0}} transition={{duration: 2}}>
                                The first alternative method to become popular was the tabular method developed by <a
                                href="https://en.wikipedia.org/wiki/Willard_Van_Orman_Quine"
                                title="Willard Van Orman Quine">Willard Quine</a> and <a
                                href="https://en.wikipedia.org/wiki/Edward_J._McCluskey" title="Edward J. McCluskey">Edward
                                McCluskey</a>. Starting with the <a href="https://en.wikipedia.org/wiki/Truth_table"
                                                                    title="Truth table">truth table</a> for a set of
                                logic functions, by combining the <a href="https://en.wikipedia.org/wiki/Minterm"
                                                                     title="Minterm">minterms</a> for which the
                                functions are active (the ON-cover) or for which the function value is irrelevant
                                (the <a href="https://en.wikipedia.org/wiki/Don%27t-care_(logic)"
                                        title="Don't-care (logic)">Don't-Care</a>-cover or DC-cover) a set of <a
                                href="https://en.wikipedia.org/wiki/Prime_implicant"
                                title="Prime implicant">prime implicants</a> is composed. Finally, a systematic
                                procedure is followed to find the smallest set of prime implicants the output functions
                                can be realised with.
                            </motion.p>
                        </section>
                    }{
                    props.step >= 2 &&
                    <AnimatePresence>

                        <section>
                            <h3>
                                <a href="https://en.wikipedia.org/wiki/Espresso_heuristic_logic_minimizer">
                                    Espresso algorithm
                                </a>
                            </h3>

                            <motion.p animate={{opacity: 1}} initial={{opacity: 0}} transition={{duration: 2}}>
                                A different approach to this issue is followed in the Espresso algorithm, developed by
                                Brayton et al. at the <a
                                href="https://en.wikipedia.org/wiki/University_of_California,_Berkeley"
                                title="University of California, Berkeley">University of
                                California, Berkeley</a>. Rather than expanding a logic function
                                into minterms, the program manipulates "cubes", representing the product terms in the
                                ON-,
                                DC-, and OFF- covers iteratively. Although the minimization result is not guaranteed to
                                be
                                the <a href="https://en.wikipedia.org/wiki/Global_minimum" title="Global minimum">global
                                minimum</a>, in practice this is very closely approximated, while the solution is always
                                free from <a href="https://en.wikipedia.org/wiki/`Logic_redundancy"
                                             title="Logic redundancy">redundancy</a>.
                            </motion.p>
                            <motion.p animate={{opacity: 1}} initial={{opacity: 0}} transition={{delay: 1.5, duration: 3}}>
                                Compared
                                to the other methods, this one is essentially more efficient, reducing memory usage and
                                computation time by several orders of magnitude. Its name reflects the way of instantly
                                making a cup of fresh coffee. There is hardly any restriction to the number of
                                variables.
                            </motion.p>
                            <motion.p animate={{opacity: 1}} initial={{opacity: 0}} transition={{delay: 4, duration: 3}}>
                                The Espresso algorithm proved so successful that it has been incorporated as a standard
                                logic function minimization step into virtually any contemporary <a
                                href="https://en.wikipedia.org/wiki/Logic_synthesis" title="Logic synthesis">logic
                                synthesis</a> tool. Espresso has inspired many derivatives.
                            </motion.p>
                            <motion.p
                                animate={{opacity: 1}}
                                initial={{opacity: 0}}
                                transition={{delay: 4, duration: 1}}
                                style={{textAlign: "center"}}
                            >
                                The latest (1994) source code for Espresso can be found
                                <a
                                    href="https://ptolemy.berkeley.edu/projects/embedded/pubs/downloads/espresso/index.htm"
                                > on the Berkeley website</a>.
                                Here's an excerpt:
                                <Code containerStyle={{margin: "0 auto"}} style={{maxHeight: "100vh"}}>
                                    {
`Fsave = sf_save(F);                    /* save original function */
D = sf_save(D1);                    /* make a scratch copy of D */

/* Setup has always been a problem */
if (recompute_onset) {
      EXEC(E = simplify(cube1list(F)),     "SIMPLIFY   ", E);
      free_cover(F);
      F = E;
}
cover_cost(F, &cost);
if (unwrap_onset && (cube.part_size[cube.num_vars - 1] > 1)
  && (cost.out != cost.cubes*cube.part_size[cube.num_vars-1])
  && (cost.out < 5000))
      EXEC(F = sf_contain(unravel(F, cube.num_vars - 1)), "SETUP      ", F);

/* Initial expand and irredundant */
foreach_set(F, last, p) {
      RESET(p, PRIME);
}
EXECUTE(F = expand(F, R, FALSE), EXPAND_TIME, F, cost);
EXECUTE(F = irredundant(F, D), IRRED_TIME, F, cost);

if (! single_expand) {
      if (remove_essential) {
          EXECUTE(E = essential(&F, &D), ESSEN_TIME, E, cost);
      } else {
          E = new_cover(0);
      }

      cover_cost(F, &cost);
      do {

          /* Repeat inner loop until solution becomes "stable" */
          do {
                copy_cost(&cost, &best_cost);
                EXECUTE(F = reduce(F, D), REDUCE_TIME, F, cost);
                EXECUTE(F = expand(F, R, FALSE), EXPAND_TIME, F, cost);
                EXECUTE(F = irredundant(F, D), IRRED_TIME, F, cost);
          } while (cost.cubes < best_cost.cubes);

          /* Perturb solution to see if we can continue to iterate */
          copy_cost(&cost, &best_cost);
          if (use_super_gasp) {
                F = super_gasp(F, D, R, &cost);
                if (cost.cubes >= best_cost.cubes)
                    break;
          } else {
                F = last_gasp(F, D, R, &cost);
          }

      } while (cost.cubes < best_cost.cubes ||
          (cost.cubes == best_cost.cubes && cost.total < best_cost.total));

      /* Append the essential cubes to F */
      F = sf_append(F, E);                /* disposes of E */
      if (trace) size_stamp(F, "ADJUST     ");
}

/* Free the D which we used */
free_cover(D);

/* Attempt to make the PLA matrix sparse */
if (! skip_make_sparse) {
      F = make_sparse(F, D1, R);
}

/*
 *  Check to make sure function is actually smaller !!
 *  This can only happen because of the initial unravel.  If we fail,
 *  then run the whole thing again without the unravel.
 */
if (Fsave->count < F->count) {
      free_cover(F);
      F = Fsave;
      unwrap_onset = FALSE;
      goto begin;
} else {
      free_cover(Fsave);
}

return F;
`
                                    }
                                </Code>
                        </motion.p>
                    </section>
                    </AnimatePresence>
                }
                </main>
            </SimpleOpacityAnimation>
        </div>
    )
}


export default {
    Slide: OtherMethods,
    steps
}
