import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../UserContext';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '648062377559-6fge85fbh1hbi6ja7j9qcpjarj9cjr4h.apps.googleusercontent.com';

function HomeScreen() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
  const [accessToken, setAccessToken] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
  });

  useEffect(() => {
    const checkStoredToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const expiry = await AsyncStorage.getItem('tokenExpiry');
      if (token && expiry && new Date().getTime() < parseInt(expiry, 10)) {
        setAccessToken(token);
        fetchEvents(token);
      }
    };
    checkStoredToken();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const expiryTime = new Date().getTime() + 3600 * 1000; // 1 hour
      AsyncStorage.setItem('accessToken', authentication.accessToken);
      AsyncStorage.setItem('tokenExpiry', expiryTime.toString());
      setAccessToken(authentication.accessToken);
      fetchEvents(authentication.accessToken);
    }
  }, [response]);

  const fetchEvents = async (token) => {
    const today = new Date();
    const oneYearAgo = new Date();
    const oneYearAhead = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAhead.setFullYear(today.getFullYear() + 1);

    try {
      const result = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${oneYearAgo.toISOString()}&timeMax=${oneYearAhead.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!result.ok) {
        throw new Error(`Error fetching events: ${result.statusText}`);
      }
      const data = await result.json();
      if (data.items) {
        const formattedEvents = data.items.map((event) => ({
          title: event.summary,
          start: event.start.date || event.start.dateTime.split('T')[0],
          end: event.end.date || event.end.dateTime.split('T')[0],
        }));
        setEvents(formattedEvents);
      } else {
        throw new Error('No events found');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const addEventToCalendar = async (token) => {
    const event = {
      summary: newEvent.title,
      start: {
        dateTime: newEvent.start,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: newEvent.end,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      if (!response.ok) {
        throw new Error(`Error adding event: ${response.statusText}`);
      }
      const result = await response.json();
      setEvents([...events, { title: result.summary, start: result.start.dateTime, end: result.end.dateTime }]);
      Alert.alert('Event added', `Event "${result.summary}" added to your calendar`);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const eventsForSelectedDate = events.filter(event => event.start === selectedDate);

  const markedDates = events.reduce((acc, event) => {
    const isFutureEvent = new Date(event.start) > new Date();
    acc[event.start] = { marked: true, dotColor: isFutureEvent ? 'green' : 'blue' };
    return acc;
  }, {});

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('tokenExpiry');
    setAccessToken(null);
  };

  useEffect(() => {
    const timer = setTimeout(handleLogout, 3600 * 1000); // 1 hour
    return () => clearTimeout(timer);
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setEventModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.fixedHeader}>
            <Text style={styles.title}>Welcome {user.displayName}!</Text>
            {!accessToken && <Button title="Connect to Google Calendar" onPress={() => promptAsync()} disabled={!request} />}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>My Appointments</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                  <Image source={require('../assets/circle-button.svg')} style={styles.addButtonImage} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout}>
                  <Image source={require('../assets/logout.svg')} style={styles.logoutButtonImage} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.calendarContainer}>
              <Calendar
                current={new Date().toISOString().split('T')[0]}
                minDate={'2022-01-01'}
                maxDate={'2024-12-31'}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                onMonthChange={() => {
                  setSelectedDate('');
                }}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#1e1e1e',
                  textSectionTitleColor: '#b6c1cd',
                  selectedDayBackgroundColor: '#673ab7',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#ff5722',
                  dayTextColor: '#ffffff',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#00adf5',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#ff5722',
                  monthTextColor: '#ffffff',
                  indicatorColor: '#ffffff',
                  textDayFontFamily: 'monospace',
                  textMonthFontFamily: 'monospace',
                  textDayHeaderFontFamily: 'monospace',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 16,
                }}
              />
            </View>
          </ScrollView>
          <Modal isVisible={eventModalVisible} onBackdropPress={() => setEventModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.dateTitle}>
                Events for {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
              </Text>
              {eventsForSelectedDate.length > 0 ? (
                eventsForSelectedDate.map((event, index) => (
                  <View key={index} style={styles.eventItem}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDates}>{`Start: ${event.start} End: ${event.end}`}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noEventsText}>No events for this date</Text>
              )}
            </View>
          </Modal>
          <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Start Date (YYYY-MM-DD)"
                value={newEvent.start}
                onChangeText={(text) => setNewEvent({ ...newEvent, start: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="End Date (YYYY-MM-DD)"
                value={newEvent.end}
                onChangeText={(text) => setNewEvent({ ...newEvent, end: text })}
              />
              <Button title="Add Event" onPress={() => addEventToCalendar(accessToken)} />
            </View>
          </Modal>
        </>
      ) : (
        <Text style={styles.noUserText}>No user information</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#2b2b2b',
  },
  fixedHeader: {
    backgroundColor: '#2b2b2b',
    zIndex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  noUserText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#673ab7',
  },
  calendarContainer: {
    width: '100%',
    maxWidth: 600,  // Increase this value to make the calendar wider
    alignSelf: 'center',
    backgroundColor: '#1e1e1e',
  },
  eventListContainer: {
    marginTop: 10,
    width: '100%',
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
  },
  eventItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#3e3e3e',
    borderRadius: 5,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  eventDates: {
    fontSize: 14,
    color: '#ffffff',
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
  selectDateText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
  addButton: {
    padding: 10,
  },
  addButtonImage: {
    width: 30,
    height: 30,
    color: '#673ab7',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    padding: 5,
  },
  logoutButtonImage: {
    width: 30,
    height: 30,
    color: '#673ab7',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
  },
});

export default HomeScreen;
