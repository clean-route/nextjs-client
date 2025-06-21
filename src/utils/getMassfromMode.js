export default function getMassfromMode(temp_mode) {
    if (temp_mode == 'car' || temp_mode == 'driving-traffic') {
        return 2500
    } else if (temp_mode == 'truck') {
        return 15000
    } else if (temp_mode == 'scooter' || temp_mode == 'two-wheeler') {
        return 150
    } else {
        return 0
    }
}