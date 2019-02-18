module.exports = {

getDistance: function (pointA, pointB) {
  
  let p = 0.017453292519943295
  let c = Math.cos
  let a = 0.5 - c((pointB.latitude - pointA.latitude) * p)/2 + c(pointA.latitude * p) * c(pointB.latitude * p) * (1 - c((pointB.longitude - pointA.longitude) * p))/2
  
  return 12742 * Math.asin(Math.sqrt(a))
},

orderByDistance: function (userLocation, eventLocations) {
  
  const array = Object.keys(eventLocations).map(index => {
    
    const distance = this.getDistance(userLocation, eventLocations[index])
    const coordOnSteroid = Object.create(eventLocations[index])
    
    
    coordOnSteroid.distance = distance
    coordOnSteroid.key = index
    coordOnSteroid.adress = eventLocations[index].adress
    coordOnSteroid.imageUrl = eventLocations[index].imageUrl
    coordOnSteroid.title = eventLocations[index].title
    
    return coordOnSteroid
  })
  return array.sort((a, b) => {
    return a.distance - b.distance
  })
}}
