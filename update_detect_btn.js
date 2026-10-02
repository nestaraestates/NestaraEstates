const fs = require('fs');
const file = '/home/vini/projects122/NestaraEstates/apps/mobile/src/app/location-picker.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldBtn = `<TouchableOpacity 
          onPress={handleDetectLocation}
          disabled={loading}
          className="absolute bottom-6 right-4 bg-white p-4 rounded-full shadow-lg shadow-zinc-900/20 items-center justify-center border border-zinc-100"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <Navigation size={24} color="#059669" />
          )}
        </TouchableOpacity>`;

const newBtn = `<TouchableOpacity 
          onPress={handleDetectLocation}
          disabled={loading}
          className="absolute bottom-6 right-4 bg-white px-5 py-3 rounded-full shadow-lg shadow-zinc-900/30 flex-row items-center justify-center border border-zinc-100"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <>
              <Navigation size={20} color="#059669" />
              <Text className="text-emerald-600 font-bold ml-2">Detect My Location</Text>
            </>
          )}
        </TouchableOpacity>`;

if (content.includes(oldBtn)) {
  content = content.replace(oldBtn, newBtn);
  fs.writeFileSync(file, content);
  console.log("Updated Detect Location button UI.");
}
