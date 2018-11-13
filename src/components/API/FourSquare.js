const API = 'https://api.foursquare.com/v2/venues'
const ID = 'MNWCTMZ00VP3ZL140X5BGSD0SOGXWL435PTT31PQ4ZTSMBHL'
const SECRET = 'Z2SMN1DR3SIUJ0I3AZYPSVJL3EJEIJWEIPPPS3UGUITYVJAJ'

export const getFourSquareInfo = (lat, lng, name) => {
    return fetch(`${API}/search?&ll=${lat},${lng}&limit=1&radius=250&query=${name}&client_id=${ID}&client_secret=${SECRET}&v=20180323`)
        .then(result => result.json())
        .then(result => {
            if (result.response.venues[0]) {
                return result.response.venues[0].id
            }
        })
        .then(LocationID =>
            fetch(`${API}/${LocationID}?&client_id=${ID}&client_secret=${SECRET}&v=20180323`)
                .then(result => result.json())
        )
        .catch('err')
}
