import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/all'

document.addEventListener('DOMContentLoaded', function() {
    gsap.registerPlugin(ScrollTrigger)
    gsap.utils.toArray('.slideup').forEach(function(elem) {
        ScrollTrigger.create({
            trigger: elem,
            start: 'center bottom',
            onEnter: () => gsap.to(elem, {autoAlpha: 1, y: 0, stagger: 0.15, overwrite: true}),
            onLeave: () => gsap.to(elem, {autoAlpha: 0, y: -40, overwrite: true}),
            onEnterBack: () => gsap.to(elem, {autoAlpha: 1, y: 0, stagger: 0.15, overwrite: true}),
            onLeaveBack: () => gsap.to(elem, {autoAlpha: 0, y: 40, overwrite: true}),
        })
    })
    ScrollTrigger.batch('.row__item', {
        interval: 0.1, 
        batchMax: 3,
        start: 'center bottom',
        onEnter: batch => gsap.to(batch, {autoAlpha: 1, y: 0, stagger: 0.15, overwrite: true}),
        onLeave: batch => gsap.to(batch, {autoAlpha: 0, y: -40, overwrite: true}),
        onEnterBack: batch => gsap.to(batch, {autoAlpha: 1, y: 0, stagger: 0.15, overwrite: true}),
        onLeaveBack: batch => gsap.to(batch, {autoAlpha: 0, y: 40, overwrite: true}),
    })
})

