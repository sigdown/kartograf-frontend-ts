import type { WorkspaceState } from '../../types/workspace'

  

export function isSameViewport(

  current: WorkspaceState['viewport'],

  next: WorkspaceState['viewport'],

) {

  if (!current || !next) {

    return current === next

  }

  

  return (

    current.lng === next.lng &&

    current.lat === next.lat &&

    current.zoom === next.zoom &&

    current.bearing === next.bearing &&

    current.pitch === next.pitch

  )

}