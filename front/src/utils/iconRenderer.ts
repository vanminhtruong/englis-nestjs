import { h } from 'vue'

export function getIconComponent(iconName: string) {
  const iconMap: Record<string, any> = {
    'folder': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
    ]),
    'user': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z' }),
      h('path', { d: 'M4 20a8 8 0 0 1 16 0Z' })
    ]),
    'mail': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('rect', { x: '3', y: '5', width: '18', height: '14', rx: '2' }),
      h('polyline', { points: '3 7 12 13 21 7' })
    ]),
    'dollar-sign': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('line', { x1: '12', y1: '2', x2: '12', y2: '22' }),
      h('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
    ]),
    'tablet': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('rect', { x: '5', y: '2', width: '14', height: '20', rx: '2' }),
      h('circle', { cx: '12', cy: '18', r: '1' })
    ]),
    'graduation-cap': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M22 10v6M2 10l10-5 10 5-10 5z' }),
      h('path', { d: 'M6 12v5c3 3 9 3 12 0v-5' })
    ]),
    'pencil': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' })
    ]),
    'feather': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z' }),
      h('line', { x1: '16', y1: '8', x2: '2', y2: '22' })
    ]),
    'code': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('polyline', { points: '16 18 22 12 16 6' }),
      h('polyline', { points: '8 6 2 12 8 18' })
    ]),
    'smile': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('path', { d: 'M8 14s1.5 2 4 2 4-2 4-2' }),
      h('line', { x1: '9', y1: '9', x2: '9.01', y2: '9' }),
      h('line', { x1: '15', y1: '9', x2: '15.01', y2: '9' })
    ]),
    'music': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M9 18V5l12-2v13' }),
      h('circle', { cx: '6', cy: '18', r: '3' }),
      h('circle', { cx: '18', cy: '16', r: '3' })
    ]),
    'trash': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M3 6h18' }),
      h('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
      h('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' })
    ]),
    'scissors': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('circle', { cx: '6', cy: '6', r: '3' }),
      h('circle', { cx: '6', cy: '18', r: '3' }),
      h('path', { d: 'M20 4 8.12 15.88' }),
      h('path', { d: 'M14.47 14.48 20 20' })
    ]),
    'palette': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('circle', { cx: '13.5', cy: '6.5', r: '.5' }),
      h('circle', { cx: '17.5', cy: '10.5', r: '.5' }),
      h('circle', { cx: '8.5', cy: '7.5', r: '.5' }),
      h('circle', { cx: '6.5', cy: '12.5', r: '.5' }),
      h('path', { d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z' })
    ]),
    'sparkles': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }),
      h('path', { d: 'M5 3v4' }),
      h('path', { d: 'M19 17v4' }),
      h('path', { d: 'M3 5h4' }),
      h('path', { d: 'M17 19h4' })
    ]),
    'flower': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15' }),
      h('circle', { cx: '12', cy: '12', r: '3' }),
      h('path', { d: 'm8 16 1.5-1.5' }),
      h('path', { d: 'M14.5 9.5 16 8' }),
      h('path', { d: 'm8 8 1.5 1.5' }),
      h('path', { d: 'M14.5 14.5 16 16' })
    ]),
    'lotus': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M12 2c2.5 0 4 2.5 4 6s-1.5 6-4 6-4-2.5-4-6 1.5-6 4-6Z' }),
      h('path', { d: 'M12 14c3.5 0 6 2.5 6 5s-2.5 3-6 3-6-.5-6-3 2.5-5 6-5Z' }),
      h('path', { d: 'M7 10a4 4 0 0 0-3 7' }),
      h('path', { d: 'M17 10a4 4 0 0 1 3 7' })
    ]),
    'camera': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z' }),
      h('circle', { cx: '12', cy: '13', r: '3' })
    ]),
    'bar-chart': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('line', { x1: '12', y1: '20', x2: '12', y2: '10' }),
      h('line', { x1: '18', y1: '20', x2: '18', y2: '4' }),
      h('line', { x1: '6', y1: '20', x2: '6', y2: '16' })
    ]),
    'disc': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('circle', { cx: '12', cy: '12', r: '2' })
    ]),
    'dumbbell': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M6.5 6.5 17 12l-4.5 8.5' }),
      h('path', { d: 'm17 12-10.5 5.5' }),
      h('path', { d: 'M5 5v14' }),
      h('path', { d: 'M3 7h4' }),
      h('path', { d: 'M3 17h4' }),
      h('path', { d: 'M19 5v14' }),
      h('path', { d: 'M17 7h4' }),
      h('path', { d: 'M17 17h4' })
    ]),
    'book': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' })
    ]),
    'scales': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'm16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z' }),
      h('path', { d: 'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z' }),
      h('path', { d: 'M7 21h10' }),
      h('path', { d: 'M12 3v18' }),
      h('path', { d: 'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2' })
    ]),
    'mic': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' }),
      h('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }),
      h('line', { x1: '12', y1: '19', x2: '12', y2: '22' })
    ]),
    'plane': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z' })
    ]),
    'globe': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
      h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
    ]),
    'wrench': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' })
    ]),
    'paw-print': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('circle', { cx: '11', cy: '4', r: '2' }),
      h('circle', { cx: '18', cy: '8', r: '2' }),
      h('circle', { cx: '20', cy: '16', r: '2' }),
      h('path', { d: 'M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z' })
    ]),
    'flask': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M9 3h6l-.6 8.7c-.1 1.3.7 2.4 1.9 3L22 18H2l5.7-3.3c1.2-.6 2-1.7 1.9-3L9 3Z' }),
      h('path', { d: 'M9 3v2' }),
      h('path', { d: 'M15 3v2' })
    ]),
    'target': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('circle', { cx: '12', cy: '12', r: '6' }),
      h('circle', { cx: '12', cy: '12', r: '2' })
    ]),
    'heart': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' })
    ]),
    'coffee': (props: any) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: props.color || 'currentColor', 'stroke-width': '2', class: props.class }, [
      h('path', { d: 'M17 8h1a4 4 0 1 1 0 8h-1' }),
      h('path', { d: 'M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z' }),
      h('line', { x1: '6', y1: '2', x2: '6', y2: '4' }),
      h('line', { x1: '10', y1: '2', x2: '10', y2: '4' }),
      h('line', { x1: '14', y1: '2', x2: '14', y2: '4' })
    ]),
  }
  
  return iconMap[iconName] || iconMap['book']
}
