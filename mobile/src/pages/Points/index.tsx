import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Constants from 'expo-constants';
import api from '../../services/api'

import { Feather as Icon } from '@expo/vector-icons'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';


interface Item{
  id: number,
  title: string,
  image_url: string
}

interface Point {
  id: number,
  image: string,
  name: string,
  latitude: number,
  longitude: number,
  image_url: string
}

interface Parms{
  uf: string,
  city: string
}

const Points = () => {

  const navigaton = useNavigation();
  const routes = useRoute();
  const routesParameters = routes.params as Parms;

  const [items, setItems] = useState<Item[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [initialPosition, setInitialPosition] = useState<[number, number]>([-23.18825900299278,-46.8908715248108])
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data)
    });
  }, []);

  useEffect(()=> {
    async function loadPosition(){
      const {status} = await Location.requestPermissionsAsync();

      if(status !== "granted"){
        Alert.alert('Oooops...', 'Precisamos da sua permissão para importar o restante do código'); 
        return
      }

      const location = await Location.getCurrentPositionAsync(); 

      const { latitude, longitude }  = location.coords; 


      setInitialPosition([
        latitude,
        longitude
      ]);

    }
  } ,[])

  useEffect(() => {
     api.get('points', {
       params: {
          city: routesParameters.city,
          uf: routesParameters.uf,
          items: [1]
       }
     }).then(response => {
        setPoints(response.data);
        
     })
  }, [selectedItems]);

  function handleSelectedItem(id: number){
    const alreadySelected = selectedItems.findIndex(x => x === id);

    if (alreadySelected >= 0){
      const filteredItems = selectedItems.filter(x => x !== id);

      setSelectedItems(filteredItems);
    }else {
      setSelectedItems([...selectedItems, id]); 
    }
  }

  function handleNavigateBack() {
    navigaton.goBack();
  }

  function handleNavigationToDetail(id: number) {
    navigaton.navigate('Detail', { point_id: id });
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name='arrow-left' size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}> Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          { initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              loadingEnabled={initialPosition[0] == 0}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}>
              { points.map(x => (
                  <Marker
                    key={String(x.id)}
                    onPress={() => handleNavigationToDetail(x.id)}
                    style={styles.mapMarker}
                    coordinate={{
                      latitude: x.latitude,
                      longitude: x.longitude
                    }}
                  >
                    <View style={styles.mapMarkerContainer}>
                      <Image style={styles.mapMarkerImage} source={{ uri: x.image_url }} />
                      <Text style={styles.mapMarkerTitle}>{x.name}</Text>
                    </View>
                  </Marker>))}
            </MapView>)}
        </View>

      </View>
      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
        {
          items.map(x => 
          (
            <TouchableOpacity 
              key={String(x.id)} 
              style={
                [
                styles.item,
                selectedItems.includes(x.id) ? styles.selectedItem : {}
                ]} 
              onPress={() => handleSelectedItem(x.id)}
              activeOpacity={0.6} 
            >
              <SvgUri  width={42} height={42} uri={x.image_url} />
              <Text style={styles.itemTitle} >{x.title}</Text>
            </TouchableOpacity>
          ))
        }
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points; 