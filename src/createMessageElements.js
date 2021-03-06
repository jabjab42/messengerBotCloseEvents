module.exports = {

createMessageElements: (orderedByDistanceObject) => {
  
  let elements
  const objectElements = Object.keys(orderedByDistanceObject).map(index => {
    
    const messageElementsSkeleton = [{}]
    const messageElements = Object.create(messageElementsSkeleton)
    
    messageElements.title = orderedByDistanceObject[index].title
    messageElements.image_url = orderedByDistanceObject[index].imageUrl
    messageElements.subtitle = orderedByDistanceObject[index].adress
    messageElements.default_action = {
      "type": "web_url", 
      "url": orderedByDistanceObject[index].url,
      "webview_height_ratio": "tall"}
    
    return messageElements
  })
return objectElements
}}

