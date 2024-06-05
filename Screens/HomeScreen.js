import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { UserContext } from '../UserContext';
import { Calendar } from 'react-native-calendars';
import * as CalendarAPI from 'expo-calendar';

function HomeScreen() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      (async () => {
        const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'We need calendar permissions to access your events.');
          return;
        }
        loadCalendarEvents();
      })();
    }
  }, []);

  const loadCalendarEvents = async () => {
    const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
    const events = await CalendarAPI.getEventsAsync(
      calendars.map((cal) => cal.id),
      new Date(2023, 0, 1),
      new Date(2024, 11, 31)
    );
    setEvents(events);
  };

  const markedDates = events.reduce((acc, event) => {
    const date = event.startDate.split('T')[0];
    acc[date] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      {user ? (
        <View>
          <Text style={styles.title}>Welcome {user.displayName}!</Text>
          <Calendar
            current={new Date().toISOString().split('T')[0]}
            minDate={'2022-01-01'}
            maxDate={'2024-12-31'}
            onDayPress={(day) => {
              Alert.alert('Selected day', day.dateString);
            }}
            monthFormat={'yyyy MM'}
            onMonthChange={(month) => {
              console.log('month changed', month);
            }}
            hideArrows={false}
            renderArrow={(direction) => <Text style={styles.arrow}>{direction === 'left' ? '<' : '>'}</Text>}
            hideExtraDays={true}
            disableMonthChange={true}
            enableSwipeMonths={true}
            onPressArrowLeft={(subtractMonth) => subtractMonth()}
            onPressArrowRight={(addMonth) => addMonth()}
            disableArrowLeft={false}
            disableArrowRight={false}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#00adf5',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#00adf5',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: 'orange',
              monthTextColor: 'blue',
              indicatorColor: 'blue',
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
      ) : (
        <Text style={styles.noUserText}>No user information</Text>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  noUserText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
  arrow: {
    fontSize: 18,
    color: 'orange',
  },
});

export default HomeScreen;
